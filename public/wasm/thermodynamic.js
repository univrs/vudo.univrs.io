let wasm;

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const EdgeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_edge_free(ptr >>> 0, 1));

const EnergyComponentFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_energycomponent_free(ptr >>> 0, 1));

const EnergySystemMetricsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_energysystemmetrics_free(ptr >>> 0, 1));

const GraphMetricsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_graphmetrics_free(ptr >>> 0, 1));

const SmallWorldMetricsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_smallworldmetrics_free(ptr >>> 0, 1));

/**
 * Graph edge
 */
export class Edge {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EdgeFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_edge_free(ptr, 0);
    }
    /**
     * @returns {bigint}
     */
    get from_node() {
        const ret = wasm.__wbg_get_edge_from_node(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set from_node(arg0) {
        wasm.__wbg_set_edge_from_node(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {bigint}
     */
    get to_node() {
        const ret = wasm.__wbg_get_edge_to_node(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set to_node(arg0) {
        wasm.__wbg_set_edge_to_node(this.__wbg_ptr, arg0);
    }
    /**
     * @param {bigint} from_node
     * @param {bigint} to_node
     */
    constructor(from_node, to_node) {
        const ret = wasm.edge_new(from_node, to_node);
        this.__wbg_ptr = ret >>> 0;
        EdgeFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) Edge.prototype[Symbol.dispose] = Edge.prototype.free;

/**
 * Energy component with EROEI accounting
 */
export class EnergyComponent {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EnergyComponentFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_energycomponent_free(ptr, 0);
    }
    /**
     * @returns {bigint}
     */
    get name_id() {
        const ret = wasm.__wbg_get_energycomponent_name_id(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set name_id(arg0) {
        wasm.__wbg_set_energycomponent_name_id(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {bigint}
     */
    get component_type() {
        const ret = wasm.__wbg_get_energycomponent_component_type(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set component_type(arg0) {
        wasm.__wbg_set_energycomponent_component_type(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get energy_output_kwh_year() {
        const ret = wasm.__wbg_get_energycomponent_energy_output_kwh_year(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set energy_output_kwh_year(arg0) {
        wasm.__wbg_set_energycomponent_energy_output_kwh_year(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get energy_input_kwh_year() {
        const ret = wasm.__wbg_get_energycomponent_energy_input_kwh_year(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set energy_input_kwh_year(arg0) {
        wasm.__wbg_set_energycomponent_energy_input_kwh_year(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get embodied_energy_kwh() {
        const ret = wasm.__wbg_get_energycomponent_embodied_energy_kwh(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set embodied_energy_kwh(arg0) {
        wasm.__wbg_set_energycomponent_embodied_energy_kwh(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get lifespan_years() {
        const ret = wasm.__wbg_get_energycomponent_lifespan_years(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set lifespan_years(arg0) {
        wasm.__wbg_set_energycomponent_lifespan_years(this.__wbg_ptr, arg0);
    }
    /**
     * @param {bigint} name_id
     * @param {bigint} component_type
     * @param {number} energy_output_kwh_year
     * @param {number} energy_input_kwh_year
     * @param {number} embodied_energy_kwh
     * @param {number} lifespan_years
     */
    constructor(name_id, component_type, energy_output_kwh_year, energy_input_kwh_year, embodied_energy_kwh, lifespan_years) {
        const ret = wasm.energycomponent_new(name_id, component_type, energy_output_kwh_year, energy_input_kwh_year, embodied_energy_kwh, lifespan_years);
        this.__wbg_ptr = ret >>> 0;
        EnergyComponentFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Embodied energy amortized over lifespan
     * @returns {number}
     */
    annualized_embodied() {
        const ret = wasm.energycomponent_annualized_embodied(this.__wbg_ptr);
        return ret;
    }
    /**
     * Total annual energy input including amortized embodied
     * @returns {number}
     */
    total_annual_input() {
        const ret = wasm.energycomponent_total_annual_input(this.__wbg_ptr);
        return ret;
    }
    /**
     * EROEI for this component
     * @returns {number}
     */
    eroei() {
        const ret = wasm.energycomponent_eroei(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) EnergyComponent.prototype[Symbol.dispose] = EnergyComponent.prototype.free;

/**
 * Energy system metrics aggregator
 */
export class EnergySystemMetrics {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(EnergySystemMetrics.prototype);
        obj.__wbg_ptr = ptr;
        EnergySystemMetricsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EnergySystemMetricsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_energysystemmetrics_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get total_output_kwh() {
        const ret = wasm.__wbg_get_energysystemmetrics_total_output_kwh(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set total_output_kwh(arg0) {
        wasm.__wbg_set_energysystemmetrics_total_output_kwh(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get total_input_kwh() {
        const ret = wasm.__wbg_get_energysystemmetrics_total_input_kwh(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set total_input_kwh(arg0) {
        wasm.__wbg_set_energysystemmetrics_total_input_kwh(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {bigint}
     */
    get component_count() {
        const ret = wasm.__wbg_get_energysystemmetrics_component_count(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set component_count(arg0) {
        wasm.__wbg_set_energysystemmetrics_component_count(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} total_output_kwh
     * @param {number} total_input_kwh
     * @param {bigint} component_count
     */
    constructor(total_output_kwh, total_input_kwh, component_count) {
        const ret = wasm.energysystemmetrics_new(total_output_kwh, total_input_kwh, component_count);
        this.__wbg_ptr = ret >>> 0;
        EnergySystemMetricsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * System-wide EROEI
     * @returns {number}
     */
    system_eroei() {
        const ret = wasm.energysystemmetrics_system_eroei(this.__wbg_ptr);
        return ret;
    }
    /**
     * Net energy available for useful work
     * @returns {number}
     */
    net_energy() {
        const ret = wasm.energysystemmetrics_net_energy(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns 1.0 if viable (EROEI >= 7), 0.0 otherwise
     * @returns {number}
     */
    is_viable() {
        const ret = wasm.energysystemmetrics_is_viable(this.__wbg_ptr);
        return ret;
    }
    /**
     * Viability level: 0=Non-viable, 1=Subsistence, 2=Critical, 3=Marginal, 4=Good, 5=Excellent
     * @returns {bigint}
     */
    viability_level() {
        const ret = wasm.energysystemmetrics_viability_level(this.__wbg_ptr);
        return ret;
    }
    /**
     * Viability assessment string
     * @returns {string}
     */
    viability_assessment() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.energysystemmetrics_viability_assessment(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) EnergySystemMetrics.prototype[Symbol.dispose] = EnergySystemMetrics.prototype.free;

/**
 * Graph metrics
 */
export class GraphMetrics {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GraphMetricsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_graphmetrics_free(ptr, 0);
    }
    /**
     * @returns {bigint}
     */
    get node_count() {
        const ret = wasm.__wbg_get_edge_from_node(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set node_count(arg0) {
        wasm.__wbg_set_edge_from_node(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {bigint}
     */
    get edge_count() {
        const ret = wasm.__wbg_get_edge_to_node(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set edge_count(arg0) {
        wasm.__wbg_set_edge_to_node(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get clustering() {
        const ret = wasm.__wbg_get_graphmetrics_clustering(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set clustering(arg0) {
        wasm.__wbg_set_graphmetrics_clustering(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get path_length() {
        const ret = wasm.__wbg_get_graphmetrics_path_length(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set path_length(arg0) {
        wasm.__wbg_set_graphmetrics_path_length(this.__wbg_ptr, arg0);
    }
    /**
     * @param {bigint} node_count
     * @param {bigint} edge_count
     * @param {number} clustering
     * @param {number} path_length
     */
    constructor(node_count, edge_count, clustering, path_length) {
        const ret = wasm.graphmetrics_new(node_count, edge_count, clustering, path_length);
        this.__wbg_ptr = ret >>> 0;
        GraphMetricsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Average degree of nodes
     * @returns {number}
     */
    average_degree() {
        const ret = wasm.graphmetrics_average_degree(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) GraphMetrics.prototype[Symbol.dispose] = GraphMetrics.prototype.free;

/**
 * Small-world network metrics (Watts-Strogatz)
 */
export class SmallWorldMetrics {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SmallWorldMetrics.prototype);
        obj.__wbg_ptr = ptr;
        SmallWorldMetricsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SmallWorldMetricsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_smallworldmetrics_free(ptr, 0);
    }
    /**
     * @returns {bigint}
     */
    get n() {
        const ret = wasm.__wbg_get_edge_from_node(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set n(arg0) {
        wasm.__wbg_set_edge_from_node(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {bigint}
     */
    get m() {
        const ret = wasm.__wbg_get_edge_to_node(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {bigint} arg0
     */
    set m(arg0) {
        wasm.__wbg_set_edge_to_node(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get k() {
        const ret = wasm.__wbg_get_graphmetrics_clustering(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set k(arg0) {
        wasm.__wbg_set_graphmetrics_clustering(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get clustering() {
        const ret = wasm.__wbg_get_graphmetrics_path_length(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set clustering(arg0) {
        wasm.__wbg_set_graphmetrics_path_length(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get path_length() {
        const ret = wasm.__wbg_get_smallworldmetrics_path_length(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set path_length(arg0) {
        wasm.__wbg_set_smallworldmetrics_path_length(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get c_random() {
        const ret = wasm.__wbg_get_smallworldmetrics_c_random(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set c_random(arg0) {
        wasm.__wbg_set_smallworldmetrics_c_random(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get l_random() {
        const ret = wasm.__wbg_get_smallworldmetrics_l_random(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set l_random(arg0) {
        wasm.__wbg_set_smallworldmetrics_l_random(this.__wbg_ptr, arg0);
    }
    /**
     * @param {bigint} n
     * @param {bigint} m
     * @param {number} k
     * @param {number} clustering
     * @param {number} path_length
     * @param {number} c_random
     * @param {number} l_random
     */
    constructor(n, m, k, clustering, path_length, c_random, l_random) {
        const ret = wasm.smallworldmetrics_new(n, m, k, clustering, path_length, c_random, l_random);
        this.__wbg_ptr = ret >>> 0;
        SmallWorldMetricsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Gamma = C / C_random (clustering relative to random)
     * @returns {number}
     */
    gamma() {
        const ret = wasm.smallworldmetrics_gamma(this.__wbg_ptr);
        return ret;
    }
    /**
     * Lambda = L / L_random (path length relative to random)
     * @returns {number}
     */
    lambda() {
        const ret = wasm.smallworldmetrics_lambda(this.__wbg_ptr);
        return ret;
    }
    /**
     * Sigma = gamma / lambda (small-world coefficient)
     * @returns {number}
     */
    sigma() {
        const ret = wasm.smallworldmetrics_sigma(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns 1.0 if small-world (sigma > 1), 0.0 otherwise
     * @returns {number}
     */
    is_small_world() {
        const ret = wasm.smallworldmetrics_is_small_world(this.__wbg_ptr);
        return ret;
    }
    /**
     * Human-readable interpretation
     * @returns {string}
     */
    interpretation() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.smallworldmetrics_interpretation(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) SmallWorldMetrics.prototype[Symbol.dispose] = SmallWorldMetrics.prototype.free;

/**
 * Run complete analysis (EROEI + Small-World) and return summary
 * @param {number} solar_mw
 * @param {bigint} node_count
 * @param {number} node_power_w
 * @param {number} network_degree
 * @param {number} clustering
 * @param {number} path_length
 * @returns {string}
 */
export function analyze_ecosystem(solar_mw, node_count, node_power_w, network_degree, clustering, path_length) {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.analyze_ecosystem(solar_mw, node_count, node_power_w, network_degree, clustering, path_length);
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Calculate small-world sigma coefficient
 * @param {number} c
 * @param {number} l
 * @param {number} c_random
 * @param {number} l_random
 * @returns {number}
 */
export function calculate_sigma(c, l, c_random, l_random) {
    const ret = wasm.calculate_sigma(c, l, c_random, l_random);
    return ret;
}

/**
 * Returns EROEI for 1 MW solar PV system
 * @returns {number}
 */
export function create_solar_pv_eroei() {
    const ret = wasm.create_solar_pv_eroei();
    return ret;
}

/**
 * Create example Dunbar-sized cluster (N=150)
 * @returns {SmallWorldMetrics}
 */
export function dunbar_cluster_example() {
    const ret = wasm.dunbar_cluster_example();
    return SmallWorldMetrics.__wrap(ret);
}

/**
 * Create hyphal network metrics (pure consumer)
 * @param {bigint} num_nodes
 * @returns {EnergySystemMetrics}
 */
export function hyphal_network_example(num_nodes) {
    const ret = wasm.hyphal_network_example(num_nodes);
    return EnergySystemMetrics.__wrap(ret);
}

/**
 * Returns annual energy consumption in kWh for Hyphal network nodes
 * @param {bigint} num_nodes
 * @param {number} power_per_node_w
 * @returns {number}
 */
export function hyphal_node_energy(num_nodes, power_per_node_w) {
    const ret = wasm.hyphal_node_energy(num_nodes, power_per_node_w);
    return ret;
}

/**
 * Initialize WASM module (called automatically)
 */
export function init() {
    wasm.init();
}

/**
 * Check if network has small-world properties
 * @param {number} sigma
 * @param {number} min_clustering
 * @param {number} c
 * @returns {boolean}
 */
export function is_small_world_network(sigma, min_clustering, c) {
    const ret = wasm.is_small_world_network(sigma, min_clustering, c);
    return ret !== 0;
}

/**
 * Calculate max nodes supportable by solar capacity
 * @param {number} solar_mw
 * @param {number} node_power_w
 * @returns {bigint}
 */
export function max_supported_nodes(solar_mw, node_power_w) {
    const ret = wasm.max_supported_nodes(solar_mw, node_power_w);
    return ret;
}

/**
 * Calculate expected clustering for random graph: C_random = k / n
 * @param {bigint} n
 * @param {number} k
 * @returns {number}
 */
export function random_clustering(n, k) {
    const ret = wasm.random_clustering(n, k);
    return ret;
}

/**
 * Calculate random graph path length using libm ln
 * @param {bigint} n
 * @param {number} k
 * @returns {number}
 */
export function random_path_length(n, k) {
    const ret = wasm.random_path_length(n, k);
    return ret;
}

/**
 * Approximate random graph path length (without ln)
 * @param {bigint} n
 * @param {number} k
 * @returns {number}
 */
export function random_path_length_approx(n, k) {
    const ret = wasm.random_path_length_approx(n, k);
    return ret;
}

/**
 * Create example small network metrics (N=100, k=6)
 * @returns {SmallWorldMetrics}
 */
export function small_network_example() {
    const ret = wasm.small_network_example();
    return SmallWorldMetrics.__wrap(ret);
}

/**
 * Create example solar system metrics
 * @returns {EnergySystemMetrics}
 */
export function solar_system_example() {
    const ret = wasm.solar_system_example();
    return EnergySystemMetrics.__wrap(ret);
}

/**
 * Version of the thermodynamic Spirit
 * @returns {string}
 */
export function version() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.version();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_externrefs;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('thermodynamic_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
