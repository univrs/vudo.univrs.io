/**
 * VUDO OS - Physarum Simulation Engine
 *
 * Core simulation logic for the Physarum polycephalum decision network.
 * Implements Murray's Law for tube thickness adaptation and
 * Hagen-Poiseuille flow dynamics.
 *
 * This is the beating heart of the slime mold - a distributed
 * computation that finds optimal paths without central coordination.
 */

import type {
    Vec3,
    VudoNode,
    Tube,
    Plasmodium,
    ResourceGradient,
    DemoScenario,
} from "./physarum";
import { SIMULATION_CONSTANTS as C } from "./physarum";

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function generateId(): string {
    return Math.random().toString(36).substring(2, 10);
}

export function vec3Distance(a: Vec3, b: Vec3): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function vec3Lerp(a: Vec3, b: Vec3, t: number): Vec3 {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
    };
}

export function vec3Normalize(v: Vec3): Vec3 {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

// ═══════════════════════════════════════════════════════════════════════════
// GRADIENT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate reliability of a gradient based on age
 * Older gradients are less trustworthy
 */
export function gradientReliability(
    gradient: ResourceGradient,
    now: number,
): number {
    const ageSeconds = (now - gradient.freshness) / 1000;
    return Math.exp(-ageSeconds / C.DECAY_TAU);
}

/**
 * Compute aggregate resource level from gradient
 */
export function aggregateGradient(gradient: ResourceGradient): number {
    // Weighted combination of resources
    return (
        gradient.compute * 0.4 +
        gradient.storage * 0.3 +
        gradient.bandwidth * 0.3
    );
}

/**
 * Calculate pressure at a node based on its resources
 * Higher resources = lower pressure (resources flow out)
 */
export function nodePressure(node: VudoNode): number {
    const agg = aggregateGradient(node.gradient);
    // Invert: high resources = low pressure (source)
    // Low resources = high pressure (sink)
    return 1.0 - agg;
}

// ═══════════════════════════════════════════════════════════════════════════
// TUBE DYNAMICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Murray's Law: optimal tube thickness scales with flow^(1/3)
 * This minimizes the cost of maintaining and using the transport network
 */
export function optimalThickness(flow: number): number {
    return Math.pow(Math.abs(flow), 1 / 3) * C.TUBE_SCALE;
}

/**
 * Adapt tube thickness toward optimal
 * Tubes that carry more flow get thicker, unused ones shrink
 */
export function adaptTube(tube: Tube, dt: number): Tube {
    const target = optimalThickness(tube.flow);
    const delta = (target - tube.thickness) * C.ADAPT_RATE * dt;

    return {
        ...tube,
        thickness: Math.max(0.001, tube.thickness + delta),
        age: tube.age + dt,
    };
}

/**
 * Hagen-Poiseuille: flow through a tube is proportional to
 * pressure difference and tube radius^4
 */
export function computeFlow(
    tube: Tube,
    sourceNode: VudoNode,
    sinkNode: VudoNode,
): number {
    const sourcePressure = nodePressure(sourceNode);
    const sinkPressure = nodePressure(sinkNode);
    const pressureDiff = sourcePressure - sinkPressure;

    // Flow is proportional to thickness^4 (Hagen-Poiseuille)
    const conductance = Math.pow(tube.thickness, 4);
    return conductance * pressureDiff * C.FLOW_RESISTANCE;
}

/**
 * Create a new tube between two nodes
 */
export function createTube(sourceId: string, sinkId: string): Tube {
    return {
        id: `${sourceId}-${sinkId}`,
        sourceId,
        sinkId,
        thickness: C.PRUNE_THRESHOLD * 2, // Start just above prune threshold
        flow: 0,
        age: 0,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// PLASMODIUM SIMULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize a plasmodium with nodes and optional connectivity
 */
export function initializePlasmodium(
    nodeCount: number,
    connectivity: number = 0.5,
): Plasmodium {
    const nodes = new Map<string, VudoNode>();
    const tubes = new Map<string, Tube>();

    // Generate nodes in a spherical arrangement
    const nodeLabels = [
        "Alpha",
        "Beta",
        "Gamma",
        "Delta",
        "Epsilon",
        "Zeta",
        "Eta",
        "Theta",
        "Iota",
        "Kappa",
        "Lambda",
        "Mu",
        "Nu",
        "Xi",
        "Omicron",
    ];

    for (let i = 0; i < nodeCount; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / nodeCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const radius = 4;

        const node: VudoNode = {
            id: generateId(),
            position: {
                x: radius * Math.sin(phi) * Math.cos(theta),
                y: radius * Math.sin(phi) * Math.sin(theta),
                z: radius * Math.cos(phi),
            },
            gradient: {
                compute: 0.3 + Math.random() * 0.4,
                storage: 0.3 + Math.random() * 0.4,
                bandwidth: 0.3 + Math.random() * 0.4,
                freshness: Date.now(),
            },
            label: nodeLabels[i] || `Node-${i}`,
            isActive: true,
            pulsePhase: Math.random() * Math.PI * 2,
        };

        nodes.set(node.id, node);
    }

    // Create initial connections based on connectivity parameter
    const nodeList = Array.from(nodes.values());
    for (let i = 0; i < nodeList.length; i++) {
        for (let j = i + 1; j < nodeList.length; j++) {
            const distance = vec3Distance(
                nodeList[i].position,
                nodeList[j].position,
            );
            // More likely to connect nearby nodes
            const connectProbability = connectivity * Math.exp(-distance / 4);

            if (Math.random() < connectProbability) {
                const tube = createTube(nodeList[i].id, nodeList[j].id);
                tubes.set(tube.id, tube);
            }
        }
    }

    return {
        nodes,
        tubes,
        cytoplasm: nodeCount * 10, // Total "mass" in system
        time: 0,
    };
}

/**
 * Apply a scenario preset to the plasmodium
 */
export function applyScenario(
    plasmodium: Plasmodium,
    scenario: DemoScenario,
): Plasmodium {
    const nodes = new Map(plasmodium.nodes);
    const nodeList = Array.from(nodes.values());

    switch (scenario) {
        case "balanced":
            // Reset all nodes to moderate, similar resources
            nodeList.forEach((node) => {
                nodes.set(node.id, {
                    ...node,
                    gradient: {
                        compute: 0.4 + Math.random() * 0.2,
                        storage: 0.4 + Math.random() * 0.2,
                        bandwidth: 0.4 + Math.random() * 0.2,
                        freshness: Date.now(),
                    },
                });
            });
            break;

        case "hotspot":
            // One node becomes resource-rich
            const hotNode =
                nodeList[Math.floor(Math.random() * nodeList.length)];
            nodes.set(hotNode.id, {
                ...hotNode,
                gradient: {
                    compute: 0.9,
                    storage: 0.85,
                    bandwidth: 0.9,
                    freshness: Date.now(),
                },
            });
            // Others become resource-poor
            nodeList
                .filter((n) => n.id !== hotNode.id)
                .forEach((node) => {
                    nodes.set(node.id, {
                        ...node,
                        gradient: {
                            compute: 0.2 + Math.random() * 0.2,
                            storage: 0.2 + Math.random() * 0.2,
                            bandwidth: 0.2 + Math.random() * 0.2,
                            freshness: Date.now(),
                        },
                    });
                });
            break;

        case "failure":
            // Deactivate a random node
            const failNode =
                nodeList[Math.floor(Math.random() * nodeList.length)];
            nodes.set(failNode.id, {
                ...failNode,
                isActive: false,
                gradient: {
                    compute: 0,
                    storage: 0,
                    bandwidth: 0,
                    freshness: Date.now(),
                },
            });
            break;

        case "growth":
            // All nodes moderately resourced, ready to expand
            nodeList.forEach((node) => {
                nodes.set(node.id, {
                    ...node,
                    gradient: {
                        compute: 0.5 + Math.random() * 0.3,
                        storage: 0.5 + Math.random() * 0.3,
                        bandwidth: 0.5 + Math.random() * 0.3,
                        freshness: Date.now(),
                    },
                });
            });
            break;

        case "migration":
        default:
            // Resources will shift dynamically in the step function
            break;
    }

    return { ...plasmodium, nodes };
}

/**
 * Main simulation step - the heartbeat of the slime mold
 */
export function step(plasmodium: Plasmodium, dt: number = C.DT): Plasmodium {
    const { tubes, nodes, time } = plasmodium;
    const newTubes = new Map<string, Tube>();
    const newNodes = new Map<string, VudoNode>();

    // 1. Update node pulse phases (for visualization)
    nodes.forEach((node, id) => {
        newNodes.set(id, {
            ...node,
            pulsePhase: (node.pulsePhase + dt * 2) % (Math.PI * 2),
        });
    });

    // 2. Compute flow through each tube (Hagen-Poiseuille)
    tubes.forEach((tube, id) => {
        const sourceNode = newNodes.get(tube.sourceId);
        const sinkNode = newNodes.get(tube.sinkId);

        if (!sourceNode || !sinkNode) return;
        if (!sourceNode.isActive || !sinkNode.isActive) {
            // Prune tubes connected to inactive nodes
            return;
        }

        const flow = computeFlow(tube, sourceNode, sinkNode);
        newTubes.set(id, { ...tube, flow });
    });

    // 3. Adapt tube thickness (Murray's Law)
    newTubes.forEach((tube, id) => {
        const adapted = adaptTube(tube, dt);
        newTubes.set(id, adapted);
    });

    // 4. Prune thin tubes
    newTubes.forEach((tube, id) => {
        if (tube.thickness < C.PRUNE_THRESHOLD) {
            newTubes.delete(id);
        }
    });

    // 5. Potentially grow new tubes toward high-gradient nodes
    const activeNodes = Array.from(newNodes.values()).filter((n) => n.isActive);

    activeNodes.forEach((node) => {
        const agg = aggregateGradient(node.gradient);

        if (
            agg > C.MIN_GRADIENT_FOR_GROWTH &&
            Math.random() < C.GROWTH_RATE * dt
        ) {
            // Find a nearby node not already connected
            const candidates = activeNodes.filter((other) => {
                if (other.id === node.id) return false;

                // Check if already connected
                const tubeId1 = `${node.id}-${other.id}`;
                const tubeId2 = `${other.id}-${node.id}`;
                if (newTubes.has(tubeId1) || newTubes.has(tubeId2))
                    return false;

                // Must be within range
                const dist = vec3Distance(node.position, other.position);
                return dist < 6;
            });

            if (candidates.length > 0) {
                // Prefer nodes with high resource gradient
                candidates.sort(
                    (a, b) =>
                        aggregateGradient(b.gradient) -
                        aggregateGradient(a.gradient),
                );

                const target = candidates[0];
                const newTube = createTube(node.id, target.id);
                newTubes.set(newTube.id, newTube);
            }
        }
    });

    return {
        nodes: newNodes,
        tubes: newTubes,
        cytoplasm: plasmodium.cytoplasm,
        time: time + dt,
    };
}

/**
 * Dynamic gradient update for 'migration' scenario
 * Resources shift sinusoidally across the network
 */
export function updateGradientsMigration(plasmodium: Plasmodium): Plasmodium {
    const nodes = new Map(plasmodium.nodes);
    const t = plasmodium.time;

    nodes.forEach((node, id) => {
        // Each node's resources oscillate at different frequencies
        const phaseOffset = node.pulsePhase;
        const compute = 0.3 + 0.4 * Math.sin(t * 0.5 + phaseOffset);
        const storage = 0.3 + 0.4 * Math.sin(t * 0.3 + phaseOffset * 1.5);
        const bandwidth = 0.3 + 0.4 * Math.sin(t * 0.4 + phaseOffset * 0.7);

        nodes.set(id, {
            ...node,
            gradient: {
                compute: Math.max(0.1, Math.min(0.9, compute)),
                storage: Math.max(0.1, Math.min(0.9, storage)),
                bandwidth: Math.max(0.1, Math.min(0.9, bandwidth)),
                freshness: Date.now(),
            },
        });
    });

    return { ...plasmodium, nodes };
}

// ═══════════════════════════════════════════════════════════════════════════
// METRICS & ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

export interface NetworkMetrics {
    totalFlow: number;
    avgThickness: number;
    tubeCount: number;
    nodeCount: number;
    activeNodeCount: number;
    networkEfficiency: number;
    avgGradient: number;
}

export function computeMetrics(plasmodium: Plasmodium): NetworkMetrics {
    const tubes = Array.from(plasmodium.tubes.values());
    const nodes = Array.from(plasmodium.nodes.values());

    const totalFlow = tubes.reduce((sum, t) => sum + Math.abs(t.flow), 0);
    const avgThickness =
        tubes.length > 0
            ? tubes.reduce((sum, t) => sum + t.thickness, 0) / tubes.length
            : 0;

    const activeNodes = nodes.filter((n) => n.isActive);
    const avgGradient =
        activeNodes.length > 0
            ? activeNodes.reduce(
                  (sum, n) => sum + aggregateGradient(n.gradient),
                  0,
              ) / activeNodes.length
            : 0;

    // Network efficiency: flow per tube (more flow through fewer tubes = more efficient)
    const networkEfficiency = tubes.length > 0 ? totalFlow / tubes.length : 0;

    return {
        totalFlow,
        avgThickness,
        tubeCount: tubes.length,
        nodeCount: nodes.length,
        activeNodeCount: activeNodes.length,
        networkEfficiency,
        avgGradient,
    };
}
