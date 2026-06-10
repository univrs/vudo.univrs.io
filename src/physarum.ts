/**
 * VUDO OS - Physarum Decision Network Types
 *
 * Type definitions for the Physarum polycephalum-inspired
 * distributed decision network visualization.
 *
 * "The system that knows what it is, becomes what it knows."
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE SIMULATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface ResourceGradient {
    compute: number; // 0.0 - 1.0: Available WASM execution slots
    storage: number; // 0.0 - 1.0: Available storage capacity
    bandwidth: number; // 0.0 - 1.0: Network throughput
    freshness: number; // Timestamp of measurement
}

export interface VudoNode {
    id: string;
    position: Vec3;
    gradient: ResourceGradient;
    label: string;
    isActive: boolean;
    pulsePhase: number; // For animation
}

export interface Tube {
    id: string;
    sourceId: string;
    sinkId: string;
    thickness: number; // Murray's Law: proportional to flow^(1/3)
    flow: number; // Current data flow
    age: number; // Seconds since creation
}

export interface Plasmodium {
    tubes: Map<string, Tube>;
    nodes: Map<string, VudoNode>;
    cytoplasm: number; // Total "mass" in network
    time: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMULATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const SIMULATION_CONSTANTS = {
    DT: 0.016, // ~60 FPS
    TUBE_SCALE: 0.1, // Base tube thickness multiplier
    ADAPT_RATE: 2.0, // How fast tubes adapt
    PRUNE_THRESHOLD: 0.015, // Minimum thickness before pruning
    GROWTH_RATE: 0.08, // How fast new tubes grow
    DECAY_TAU: 30.0, // Gradient reliability decay (seconds)
    FLOW_RESISTANCE: 0.001, // Hagen-Poiseuille coefficient
    MIN_GRADIENT_FOR_GROWTH: 0.3, // Minimum gradient to trigger growth
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// VISUALIZATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface VisualizationConfig {
    nodeBaseSize: number;
    nodeGlowIntensity: number;
    tubeSegments: number;
    tubeRadialSegments: number;
    particleCount: number;
    particleSpeed: number;
    cameraDistance: number;
    rotationSpeed: number;
    bloomStrength: number;
    bloomRadius: number;
    bloomThreshold: number;
}

export const DEFAULT_VIZ_CONFIG: VisualizationConfig = {
    nodeBaseSize: 0.3,
    nodeGlowIntensity: 2.0,
    tubeSegments: 32,
    tubeRadialSegments: 8,
    particleCount: 50,
    particleSpeed: 0.02,
    cameraDistance: 12,
    rotationSpeed: 0.0003,
    bloomStrength: 1.5,
    bloomRadius: 0.4,
    bloomThreshold: 0.2,
};

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE (VUDO Aesthetic)
// ═══════════════════════════════════════════════════════════════════════════

export const VUDO_COLORS = {
    // Primary mystical palette
    void: "#080808", // Deep space black
    mycelium: "#e8c25a", // Site green (matches --glow-green)
    cytoplasm: "#f4d77c", // Living gold
    substrate: "#1a1a12", // Dark purple-black

    // Gradient colors for resource types
    compute: "#f4d77c", // Warm coral for compute
    storage: "#b9a06c", // Cool cyan for storage
    bandwidth: "#7a6a32", // Purple for bandwidth

    // UI accents
    glow: "#e8c25a",
    pulse: "#f4d77c",
    inactive: "#2d2a1c",

    // Tube flow visualization
    flowHigh: "#f4d77c",
    flowMedium: "#e8c25a",
    flowLow: "#4a452e",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DEMO PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export type DemoScenario =
    | "balanced" // All nodes have similar resources
    | "hotspot" // One node has high resources
    | "migration" // Resources shift over time
    | "failure" // A node goes offline
    | "growth"; // Network expanding

export interface DemoConfig {
    scenario: DemoScenario;
    nodeCount: number;
    initialConnectivity: number; // 0-1: how connected to start
    dynamicGradients: boolean;
    showLabels: boolean;
    showMetrics: boolean;
}

export const DEFAULT_DEMO_CONFIG: DemoConfig = {
    scenario: "balanced",
    nodeCount: 7,
    initialConnectivity: 0.6,
    dynamicGradients: true,
    showLabels: true,
    showMetrics: true,
};
