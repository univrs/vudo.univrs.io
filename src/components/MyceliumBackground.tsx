import {
    useRef,
    useMemo,
    useState,
    useEffect,
    Component,
    ReactNode,
} from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { StaticBackground } from "./StaticBackground";

// Extend Three.js line to avoid conflict with SVG line
extend({ Line_: THREE.Line });

interface Node {
    id: string;
    position: THREE.Vector3;
    type: "mitan" | "node" | "spirit";
    activity: number;
}

interface Edge {
    from: THREE.Vector3;
    to: THREE.Vector3;
    strength: number;
}

interface MyceliumProps {
    nodeCount?: number;
    connectionProbability?: number;
}

// Error Boundary to catch WebGL/Three.js errors
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class WebGLErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.warn(
            "WebGL/Three.js error caught, falling back to static background:",
            error.message,
        );
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// Check if WebGL is supported and device can handle it
function useWebGLSupport(): { supported: boolean; checked: boolean } {
    const [state, setState] = useState({ supported: false, checked: false });

    useEffect(() => {
        // Check for mobile device via user agent
        const isMobileDevice =
            /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
            );

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        // Check WebGL support
        let hasWebGL = false;
        try {
            const canvas = document.createElement("canvas");
            const gl =
                canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl");
            hasWebGL = !!gl;

            // Clean up
            if (gl && "getExtension" in gl) {
                const loseContext = (gl as WebGLRenderingContext).getExtension(
                    "WEBGL_lose_context",
                );
                if (loseContext) loseContext.loseContext();
            }
        } catch {
            hasWebGL = false;
        }

        // Check for low-power device (small screen + touch)
        const isLowPowerDevice =
            window.innerWidth < 768 && "ontouchstart" in window;

        // Only use WebGL on capable desktop devices
        const shouldUseWebGL =
            hasWebGL &&
            !isMobileDevice &&
            !prefersReducedMotion &&
            !isLowPowerDevice;

        setState({ supported: shouldUseWebGL, checked: true });
    }, []);

    return state;
}

function generateNetwork(nodeCount: number, connectionProbability: number) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    for (let i = 0; i < nodeCount; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const radius = 5 + Math.random() * 3;

        nodes.push({
            id: `node-${i}`,
            position: new THREE.Vector3(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi),
            ),
            type: i === 0 ? "mitan" : Math.random() > 0.9 ? "spirit" : "node",
            activity: Math.random(),
        });
    }

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const distance = nodes[i].position.distanceTo(nodes[j].position);
            if (distance < 4 && Math.random() < connectionProbability) {
                edges.push({
                    from: nodes[i].position,
                    to: nodes[j].position,
                    strength: 1 - distance / 4,
                });
            }
        }
    }

    return { nodes, edges };
}

function MyceliumNode({ node }: { node: Node }) {
    const meshRef = useRef<THREE.Mesh>(null);

    const color = useMemo(() => {
        switch (node.type) {
            case "mitan":
                return new THREE.Color("#00ff88");
            case "spirit":
                return new THREE.Color("#8b5cf6");
            default:
                return new THREE.Color("#00cc6a");
        }
    }, [node.type]);

    const size =
        node.type === "mitan" ? 0.15 : node.type === "spirit" ? 0.08 : 0.05;

    useFrame(({ clock }) => {
        if (meshRef.current) {
            const pulse =
                1 +
                0.1 *
                    Math.sin(
                        clock.elapsedTime * 2 + node.activity * Math.PI * 2,
                    );
            meshRef.current.scale.setScalar(size * pulse);
        }
    });

    return (
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <mesh ref={meshRef} position={node.position}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
        </Float>
    );
}

function MyceliumEdge({
    from,
    to,
}: {
    from: THREE.Vector3;
    to: THREE.Vector3;
}) {
    const points = useMemo(() => {
        const mid = from.clone().add(to).multiplyScalar(0.5);
        const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
        return curve.getPoints(20);
    }, [from, to]);

    const geometry = useMemo(
        () => new THREE.BufferGeometry().setFromPoints(points),
        [points],
    );
    const material = useMemo(
        () =>
            new THREE.LineBasicMaterial({
                color: "#00ff88",
                transparent: true,
                opacity: 0.2,
            }),
        [],
    );

    return <primitive object={new THREE.Line(geometry, material)} />;
}

function MyceliumNetwork({
    nodeCount = 50,
    connectionProbability = 0.25,
}: MyceliumProps) {
    const { nodes, edges } = useMemo(
        () => generateNetwork(nodeCount, connectionProbability),
        [nodeCount, connectionProbability],
    );

    const groupRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.05;
            groupRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {edges.map((edge, i) => (
                <MyceliumEdge key={`edge-${i}`} from={edge.from} to={edge.to} />
            ))}
            {nodes.map((node) => (
                <MyceliumNode key={node.id} node={node} />
            ))}
        </group>
    );
}

function WebGLBackground({ nodeCount, connectionProbability }: MyceliumProps) {
    return (
        <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)]">
            <Canvas
                camera={{ position: [0, 0, 12], fov: 60 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }}
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.1} />
                <MyceliumNetwork
                    nodeCount={nodeCount}
                    connectionProbability={connectionProbability}
                />
                <fog attach="fog" args={["#0a0a0f", 8, 20]} />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)]/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[var(--bg-primary)]/60" />
        </div>
    );
}

export function MyceliumBackground({
    nodeCount = 60,
    connectionProbability = 0.25,
}: MyceliumProps) {
    const { supported: webglSupported, checked } = useWebGLSupport();

    // Show nothing while checking (prevents flash)
    if (!checked) {
        return <div className="fixed inset-0 -z-10 bg-[var(--bg-primary)]" />;
    }

    // Use static background for mobile/unsupported devices
    if (!webglSupported) {
        return <StaticBackground />;
    }

    // Use WebGL with error boundary fallback
    return (
        <WebGLErrorBoundary fallback={<StaticBackground />}>
            <WebGLBackground
                nodeCount={nodeCount}
                connectionProbability={connectionProbability}
            />
        </WebGLErrorBoundary>
    );
}

export default MyceliumBackground;
