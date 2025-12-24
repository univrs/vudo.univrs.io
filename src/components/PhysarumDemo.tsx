/**
 * VUDO OS - Physarum Visualization Component
 *
 * Three.js-powered 3D visualization of the Physarum decision network.
 * Renders the slime mold as glowing nodes connected by pulsing tubes.
 *
 * "The network IS Bondye."
 */

import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import type {
    Plasmodium,
    VudoNode,
    Tube,
    DemoScenario,
    DemoConfig,
    VisualizationConfig,
} from "../physarum";
import {
    VUDO_COLORS,
    DEFAULT_VIZ_CONFIG,
    DEFAULT_DEMO_CONFIG,
} from "../physarum";
import {
    initializePlasmodium,
    applyScenario,
    step,
    updateGradientsMigration,
    computeMetrics,
    aggregateGradient,
    vec3Distance,
    type NetworkMetrics,
} from "../PhysarumEngine";

// ═══════════════════════════════════════════════════════════════════════════
// WEBGL DETECTION
// ═══════════════════════════════════════════════════════════════════════════

export function isWebGLAvailable(): boolean {
    try {
        const canvas = document.createElement("canvas");
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl"))
        );
    } catch (e) {
        return false;
    }
}

export function isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════════════════

interface PhysarumDemoProps {
    className?: string;
    config?: Partial<DemoConfig>;
    vizConfig?: Partial<VisualizationConfig>;
    onMetricsUpdate?: (metrics: NetworkMetrics) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// SHADER MATERIALS
// ═══════════════════════════════════════════════════════════════════════════

const nodeVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nodeFragmentShader = `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPulse;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Fresnel effect for glow
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);

    // Pulsing glow
    float pulse = 0.7 + 0.3 * sin(uPulse);

    vec3 glowColor = uColor * uIntensity * (0.5 + fresnel * 0.5) * pulse;

    gl_FragColor = vec4(glowColor, 0.9);
  }
`;

const tubeVertexShader = `
  attribute float flowIntensity;
  varying float vFlowIntensity;
  varying vec2 vUv;

  void main() {
    vFlowIntensity = flowIntensity;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const tubeFragmentShader = `
  uniform vec3 uColorHigh;
  uniform vec3 uColorLow;
  uniform float uTime;

  varying float vFlowIntensity;
  varying vec2 vUv;

  void main() {
    // Animated flow pattern
    float flow = sin(vUv.x * 20.0 - uTime * 3.0) * 0.5 + 0.5;
    float flowPulse = smoothstep(0.3, 0.7, flow);

    // Color based on flow intensity
    vec3 color = mix(uColorLow, uColorHigh, vFlowIntensity);

    // Add flow animation
    color += vec3(0.2, 0.15, 0.05) * flowPulse * vFlowIntensity;

    // Fade at edges
    float edgeFade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);

    gl_FragColor = vec4(color * edgeFade, 0.8);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PhysarumDemo: React.FC<PhysarumDemoProps> = ({
    className = "",
    config: configOverride = {},
    vizConfig: vizConfigOverride = {},
    onMetricsUpdate,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const animationRef = useRef<number>(0);

    const nodeObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map());
    const tubeObjectsRef = useRef<Map<string, THREE.Mesh>>(new Map());
    const labelsRef = useRef<Map<string, HTMLDivElement>>(new Map());

    const plasmodiumRef = useRef<Plasmodium | null>(null);
    const timeRef = useRef<number>(0);
    const isRunningRef = useRef<boolean>(true);
    const scenarioRef = useRef<DemoScenario>(
        configOverride.scenario || DEFAULT_DEMO_CONFIG.scenario,
    );
    const syncVisualizationRef = useRef<(p: Plasmodium) => void>(() => {});

    const [isRunning, setIsRunning] = useState(true);
    const [scenario, setScenario] = useState<DemoScenario>(
        configOverride.scenario || DEFAULT_DEMO_CONFIG.scenario,
    );
    const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
    const [webGLError, setWebGLError] = useState<string | null>(null);
    const [isMobile] = useState(
        () => typeof window !== "undefined" && isMobileDevice(),
    );

    const config: DemoConfig = useMemo(
        () => ({
            ...DEFAULT_DEMO_CONFIG,
            ...configOverride,
            scenario,
        }),
        [configOverride, scenario],
    );

    const vizConfig: VisualizationConfig = useMemo(
        () => ({
            ...DEFAULT_VIZ_CONFIG,
            ...vizConfigOverride,
        }),
        [vizConfigOverride],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // THREE.JS SETUP
    // ─────────────────────────────────────────────────────────────────────────

    const initThree = useCallback(() => {
        if (!containerRef.current) return;

        // Check WebGL availability
        if (!isWebGLAvailable()) {
            setWebGLError("WebGL is not supported on this device");
            return;
        }

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        try {
            // Scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(VUDO_COLORS.void);
            scene.fog = new THREE.FogExp2(VUDO_COLORS.void, 0.02);
            sceneRef.current = scene;

            // Camera
            const camera = new THREE.PerspectiveCamera(
                60,
                width / height,
                0.1,
                1000,
            );
            camera.position.set(0, 0, vizConfig.cameraDistance);
            cameraRef.current = camera;

            // Renderer - with mobile-friendly settings
            const renderer = new THREE.WebGLRenderer({
                antialias: !isMobile, // Disable antialiasing on mobile
                alpha: true,
                powerPreference: isMobile ? "low-power" : "high-performance",
                failIfMajorPerformanceCaveat: false,
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(
                Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
            );
            renderer.toneMapping = THREE.ReinhardToneMapping;
            renderer.toneMappingExposure = 1.5;
            container.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // Post-processing (bloom) - skip on mobile for performance
            if (!isMobile) {
                const composer = new EffectComposer(renderer);
                composer.addPass(new RenderPass(scene, camera));

                const bloomPass = new UnrealBloomPass(
                    new THREE.Vector2(width, height),
                    vizConfig.bloomStrength,
                    vizConfig.bloomRadius,
                    vizConfig.bloomThreshold,
                );
                composer.addPass(bloomPass);
                composerRef.current = composer;
            }

            // Controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = vizConfig.rotationSpeed * 100;
            controlsRef.current = controls;

            // Ambient light
            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            scene.add(ambientLight);

            // Point light at center
            const pointLight = new THREE.PointLight(
                new THREE.Color(VUDO_COLORS.mycelium).getHex(),
                2,
                50,
            );
            pointLight.position.set(0, 0, 0);
            scene.add(pointLight);

            // Background particles (substrate) - fewer on mobile
            const particleGeometry = new THREE.BufferGeometry();
            const particleCount = isMobile ? 100 : 500;
            const positions = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 30;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
            }

            particleGeometry.setAttribute(
                "position",
                new THREE.BufferAttribute(positions, 3),
            );

            const particleMaterial = new THREE.PointsMaterial({
                color: new THREE.Color(VUDO_COLORS.inactive),
                size: 0.05,
                transparent: true,
                opacity: 0.5,
            });

            const particles = new THREE.Points(
                particleGeometry,
                particleMaterial,
            );
            scene.add(particles);

            // Handle resize
            const handleResize = () => {
                if (!container || !camera || !renderer) return;

                const newWidth = container.clientWidth;
                const newHeight = container.clientHeight;

                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();

                renderer.setSize(newWidth, newHeight);
                if (composerRef.current) {
                    composerRef.current.setSize(newWidth, newHeight);
                }
            };

            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
                if (container.contains(renderer.domElement)) {
                    container.removeChild(renderer.domElement);
                }
                renderer.dispose();
            };
        } catch (error) {
            console.error("Failed to initialize Three.js:", error);
            setWebGLError("Failed to initialize 3D visualization");
            return;
        }
    }, [vizConfig, isMobile]);

    // ─────────────────────────────────────────────────────────────────────────
    // NODE & TUBE CREATION
    // ─────────────────────────────────────────────────────────────────────────

    const createNodeMesh = useCallback(
        (node: VudoNode): THREE.Mesh => {
            const geometry = new THREE.SphereGeometry(
                vizConfig.nodeBaseSize,
                32,
                32,
            );

            const gradient = aggregateGradient(node.gradient);
            const color = new THREE.Color().lerpColors(
                new THREE.Color(VUDO_COLORS.flowLow),
                new THREE.Color(VUDO_COLORS.mycelium),
                gradient,
            );

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uColor: { value: color },
                    uIntensity: { value: vizConfig.nodeGlowIntensity },
                    uPulse: { value: node.pulsePhase },
                },
                vertexShader: nodeVertexShader,
                fragmentShader: nodeFragmentShader,
                transparent: true,
                side: THREE.FrontSide,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                node.position.x,
                node.position.y,
                node.position.z,
            );
            mesh.scale.setScalar(node.isActive ? 1 + gradient * 0.5 : 0.3);

            return mesh;
        },
        [vizConfig],
    );

    const createTubeMesh = useCallback(
        (tube: Tube, sourceNode: VudoNode, sinkNode: VudoNode): THREE.Mesh => {
            const start = new THREE.Vector3(
                sourceNode.position.x,
                sourceNode.position.y,
                sourceNode.position.z,
            );
            const end = new THREE.Vector3(
                sinkNode.position.x,
                sinkNode.position.y,
                sinkNode.position.z,
            );

            const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();

            // Create tube geometry
            const geometry = new THREE.CylinderGeometry(
                tube.thickness,
                tube.thickness,
                length,
                vizConfig.tubeRadialSegments,
                vizConfig.tubeSegments,
            );

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uColorHigh: {
                        value: new THREE.Color(VUDO_COLORS.flowHigh),
                    },
                    uColorLow: { value: new THREE.Color(VUDO_COLORS.flowLow) },
                    uTime: { value: 0 },
                },
                vertexShader: tubeVertexShader,
                fragmentShader: tubeFragmentShader,
                transparent: true,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(midPoint);

            // Orient tube along the connection
            const up = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(
                up,
                direction.normalize(),
            );
            mesh.quaternion.copy(quaternion);

            return mesh;
        },
        [vizConfig],
    );

    // ─────────────────────────────────────────────────────────────────────────
    // SYNCHRONIZE VISUALIZATION WITH SIMULATION
    // ─────────────────────────────────────────────────────────────────────────

    const syncVisualization = useCallback(
        (plasmodium: Plasmodium) => {
            const scene = sceneRef.current;
            if (!scene) return;

            const nodeObjects = nodeObjectsRef.current;
            const tubeObjects = tubeObjectsRef.current;

            // Update or create node meshes
            plasmodium.nodes.forEach((node, id) => {
                let mesh = nodeObjects.get(id);

                if (!mesh) {
                    mesh = createNodeMesh(node);
                    scene.add(mesh);
                    nodeObjects.set(id, mesh);
                }

                // Update position and properties
                mesh.position.set(
                    node.position.x,
                    node.position.y,
                    node.position.z,
                );

                const gradient = aggregateGradient(node.gradient);
                const scale = node.isActive ? 1 + gradient * 0.5 : 0.3;
                mesh.scale.setScalar(scale);

                // Update shader uniforms
                const material = mesh.material as THREE.ShaderMaterial;
                if (material.uniforms) {
                    material.uniforms.uPulse.value = node.pulsePhase;

                    const color = new THREE.Color().lerpColors(
                        new THREE.Color(VUDO_COLORS.flowLow),
                        new THREE.Color(
                            node.isActive
                                ? VUDO_COLORS.mycelium
                                : VUDO_COLORS.inactive,
                        ),
                        gradient,
                    );
                    material.uniforms.uColor.value = color;
                }
            });

            // Remove deleted nodes
            nodeObjects.forEach((mesh, id) => {
                if (!plasmodium.nodes.has(id)) {
                    scene.remove(mesh);
                    mesh.geometry.dispose();
                    (mesh.material as THREE.Material).dispose();
                    nodeObjects.delete(id);
                }
            });

            // Update or create tube meshes
            plasmodium.tubes.forEach((tube, id) => {
                const sourceNode = plasmodium.nodes.get(tube.sourceId);
                const sinkNode = plasmodium.nodes.get(tube.sinkId);

                if (!sourceNode || !sinkNode) return;

                let mesh = tubeObjects.get(id);

                if (!mesh) {
                    mesh = createTubeMesh(tube, sourceNode, sinkNode);
                    scene.add(mesh);
                    tubeObjects.set(id, mesh);
                }

                // Update tube properties
                const start = new THREE.Vector3(
                    sourceNode.position.x,
                    sourceNode.position.y,
                    sourceNode.position.z,
                );
                const end = new THREE.Vector3(
                    sinkNode.position.x,
                    sinkNode.position.y,
                    sinkNode.position.z,
                );

                const midPoint = new THREE.Vector3().lerpVectors(
                    start,
                    end,
                    0.5,
                );
                const direction = new THREE.Vector3().subVectors(end, start);
                const length = direction.length();

                mesh.position.copy(midPoint);
                mesh.scale.set(tube.thickness * 10, 1, tube.thickness * 10);

                const up = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(
                    up,
                    direction.normalize(),
                );
                mesh.quaternion.copy(quaternion);

                // Update shader time uniform for flow animation
                const material = mesh.material as THREE.ShaderMaterial;
                if (material.uniforms) {
                    material.uniforms.uTime.value = timeRef.current;
                }
            });

            // Remove deleted tubes
            tubeObjects.forEach((mesh, id) => {
                if (!plasmodium.tubes.has(id)) {
                    scene.remove(mesh);
                    mesh.geometry.dispose();
                    (mesh.material as THREE.Material).dispose();
                    tubeObjects.delete(id);
                }
            });
        },
        [createNodeMesh, createTubeMesh],
    );

    // Keep refs in sync with state
    useEffect(() => {
        syncVisualizationRef.current = syncVisualization;
    }, [syncVisualization]);

    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    // ─────────────────────────────────────────────────────────────────────────
    // ANIMATION LOOP (legacy - kept for reference but not used)
    // ─────────────────────────────────────────────────────────────────────────

    const animate = useCallback(() => {
        animationRef.current = requestAnimationFrame(animate);

        const controls = controlsRef.current;
        const composer = composerRef.current;

        if (controls) controls.update();

        // Update simulation
        if (isRunning && plasmodiumRef.current) {
            let plasmodium = plasmodiumRef.current;

            // Apply dynamic gradient changes for migration scenario
            if (config.scenario === "migration" && config.dynamicGradients) {
                plasmodium = updateGradientsMigration(plasmodium);
            }

            // Step simulation
            plasmodium = step(plasmodium);
            plasmodiumRef.current = plasmodium;

            // Sync visualization
            syncVisualization(plasmodium);

            // Update metrics
            const newMetrics = computeMetrics(plasmodium);
            setMetrics(newMetrics);
            if (onMetricsUpdate) {
                onMetricsUpdate(newMetrics);
            }
        }

        timeRef.current += 0.016;

        if (composer) {
            composer.render();
        }
    }, [isRunning, config.scenario, config.dynamicGradients]);

    // ─────────────────────────────────────────────────────────────────────────
    // INITIALIZATION (runs once on mount)
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        const cleanup = initThree();

        // Initialize plasmodium
        let plasmodium = initializePlasmodium(
            config.nodeCount,
            config.initialConnectivity,
        );
        plasmodium = applyScenario(plasmodium, config.scenario);
        plasmodiumRef.current = plasmodium;

        // Start animation loop
        const runAnimation = () => {
            animationRef.current = requestAnimationFrame(runAnimation);

            const controls = controlsRef.current;
            const composer = composerRef.current;

            if (controls) controls.update();

            // Update simulation
            if (plasmodiumRef.current) {
                let plas = plasmodiumRef.current;

                // Step simulation only if running
                if (isRunningRef.current) {
                    // Apply dynamic gradient changes for migration scenario
                    if (scenarioRef.current === "migration") {
                        plas = updateGradientsMigration(plas);
                    }
                    plas = step(plas);
                    plasmodiumRef.current = plas;
                }

                // Always sync visualization
                syncVisualizationRef.current(plas);

                // Update metrics
                const newMetrics = computeMetrics(plas);
                setMetrics(newMetrics);
            }

            timeRef.current += 0.016;

            // Render - use composer if available (desktop), otherwise direct render (mobile)
            if (composerRef.current) {
                composerRef.current.render();
            } else if (
                rendererRef.current &&
                sceneRef.current &&
                cameraRef.current
            ) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        runAnimation();

        return () => {
            cancelAnimationFrame(animationRef.current);
            if (cleanup) cleanup();

            // Cleanup node and tube objects
            nodeObjectsRef.current.forEach((mesh) => {
                mesh.geometry.dispose();
                (mesh.material as THREE.Material).dispose();
            });
            nodeObjectsRef.current.clear();

            tubeObjectsRef.current.forEach((mesh) => {
                mesh.geometry.dispose();
                (mesh.material as THREE.Material).dispose();
            });
            tubeObjectsRef.current.clear();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle scenario changes
    useEffect(() => {
        scenarioRef.current = scenario;
        if (plasmodiumRef.current) {
            plasmodiumRef.current = applyScenario(
                plasmodiumRef.current,
                scenario,
            );
        }
    }, [scenario]);

    // ─────────────────────────────────────────────────────────────────────────
    // CONTROLS UI
    // ─────────────────────────────────────────────────────────────────────────

    const handleScenarioChange = (newScenario: DemoScenario) => {
        setScenario(newScenario);
    };

    const clearAllMeshes = useCallback(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        // Remove all node meshes
        nodeObjectsRef.current.forEach((mesh) => {
            scene.remove(mesh);
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose();
        });
        nodeObjectsRef.current.clear();

        // Remove all tube meshes
        tubeObjectsRef.current.forEach((mesh) => {
            scene.remove(mesh);
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose();
        });
        tubeObjectsRef.current.clear();
    }, []);

    const handleReset = () => {
        // Clear all existing meshes first
        clearAllMeshes();

        // Create fresh plasmodium
        let plasmodium = initializePlasmodium(
            config.nodeCount,
            config.initialConnectivity,
        );
        plasmodium = applyScenario(plasmodium, scenario);
        plasmodiumRef.current = plasmodium;

        // Reset time
        timeRef.current = 0;

        // Sync visualization with new state
        syncVisualization(plasmodium);

        // Update metrics
        const newMetrics = computeMetrics(plasmodium);
        setMetrics(newMetrics);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    // Return null if WebGL is not available - let parent handle the fallback
    if (webGLError) {
        return null;
    }

    return (
        <div className={`physarum-demo ${className}`}>
            <div ref={containerRef} className="physarum-canvas" />

            {/* Controls Panel */}
            <div className="physarum-controls">
                <h3 className="controls-title">
                    <span className="glyph">◈</span> Physarum Network
                </h3>

                <div className="control-group">
                    <label>Scenario</label>
                    <div className="scenario-buttons">
                        {(
                            [
                                "balanced",
                                "hotspot",
                                "migration",
                                "failure",
                                "growth",
                            ] as DemoScenario[]
                        ).map((s) => (
                            <button
                                key={s}
                                className={`scenario-btn ${scenario === s ? "active" : ""}`}
                                onClick={() => handleScenarioChange(s)}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-group">
                    <label>Simulation</label>
                    <div className="sim-controls">
                        <button
                            className={`sim-btn ${isRunning ? "active" : ""}`}
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? "⏸ Pause" : "▶ Play"}
                        </button>
                        <button className="sim-btn" onClick={handleReset}>
                            ↺ Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Panel */}
            {config.showMetrics && metrics && (
                <div className="physarum-metrics">
                    <div className="metric">
                        <span className="metric-label">Tubes</span>
                        <span className="metric-value">
                            {metrics.tubeCount}
                        </span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Active Nodes</span>
                        <span className="metric-value">
                            {metrics.activeNodeCount}/{metrics.nodeCount}
                        </span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Total Flow</span>
                        <span className="metric-value">
                            {metrics.totalFlow.toFixed(3)}
                        </span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Efficiency</span>
                        <span className="metric-value">
                            {(metrics.networkEfficiency * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Avg Gradient</span>
                        <span className="metric-value">
                            {(metrics.avgGradient * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            )}

            {/* Info Overlay */}
            <div className="physarum-info">
                <p>
                    <strong>Physarum polycephalum</strong> — The slime mold that
                    computes.
                </p>
                <p>
                    Watch the network self-optimize: tubes grow toward
                    resources, thicken with flow, and prune when unused.
                </p>
                <p className="tagline">
                    <em>
                        "The system that knows what it is, becomes what it
                        knows."
                    </em>
                </p>
            </div>
        </div>
    );
};

export default PhysarumDemo;
