// TypeScript bindings for thermodynamic WASM module
// Generated from DOL schemas: eroei.dol, small_world.dol

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let wasmModule: any = null;
let initPromise: Promise<void> | null = null;

export async function initThermodynamic(): Promise<void> {
  if (wasmModule) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Dynamic import of WASM module from public folder
    const response = await fetch('/wasm/thermodynamic.js');
    const jsCode = await response.text();

    // Create a blob URL to import the module
    const blob = new Blob([jsCode], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);

    try {
      const js = await import(/* @vite-ignore */ blobUrl);
      await js.default('/wasm/thermodynamic_bg.wasm');
      wasmModule = js;
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  })();

  return initPromise;
}

// EROEI Functions
export async function createSolarPVEroei(): Promise<number> {
  await initThermodynamic();
  return wasmModule.create_solar_pv_eroei();
}

export async function hyphalNodeEnergy(numNodes: bigint, powerPerNodeW: number): Promise<number> {
  await initThermodynamic();
  return wasmModule.hyphal_node_energy(numNodes, powerPerNodeW);
}

export async function maxSupportedNodes(solarMW: number, nodePowerW: number): Promise<bigint> {
  await initThermodynamic();
  return wasmModule.max_supported_nodes(solarMW, nodePowerW);
}

export async function solarSystemExample(): Promise<EnergySystemMetrics> {
  await initThermodynamic();
  const result = wasmModule.solar_system_example();
  return new EnergySystemMetrics(result);
}

export async function hyphalNetworkExample(numNodes: bigint): Promise<EnergySystemMetrics> {
  await initThermodynamic();
  const result = wasmModule.hyphal_network_example(numNodes);
  return new EnergySystemMetrics(result);
}

// Small-World Functions
export async function randomClustering(n: bigint, k: number): Promise<number> {
  await initThermodynamic();
  return wasmModule.random_clustering(n, k);
}

export async function randomPathLength(n: bigint, k: number): Promise<number> {
  await initThermodynamic();
  return wasmModule.random_path_length(n, k);
}

export async function calculateSigma(c: number, l: number, cRandom: number, lRandom: number): Promise<number> {
  await initThermodynamic();
  return wasmModule.calculate_sigma(c, l, cRandom, lRandom);
}

export async function dunbarClusterExample(): Promise<SmallWorldMetrics> {
  await initThermodynamic();
  const result = wasmModule.dunbar_cluster_example();
  return new SmallWorldMetrics(result);
}

export async function analyzeEcosystem(
  solarMW: number,
  nodeCount: bigint,
  nodePowerW: number,
  networkDegree: number,
  clustering: number,
  pathLength: number
): Promise<string> {
  await initThermodynamic();
  return wasmModule.analyze_ecosystem(solarMW, nodeCount, nodePowerW, networkDegree, clustering, pathLength);
}

// Wrapper classes for WASM objects
export class EnergySystemMetrics {
  private _inner: any;

  constructor(inner: any) {
    this._inner = inner;
  }

  get totalOutputKwh(): number {
    return this._inner.total_output_kwh;
  }

  get totalInputKwh(): number {
    return this._inner.total_input_kwh;
  }

  get componentCount(): bigint {
    return this._inner.component_count;
  }

  systemEroei(): number {
    return this._inner.system_eroei();
  }

  netEnergy(): number {
    return this._inner.net_energy();
  }

  isViable(): boolean {
    return this._inner.is_viable() > 0.5;
  }

  viabilityLevel(): bigint {
    return this._inner.viability_level();
  }

  viabilityAssessment(): string {
    return this._inner.viability_assessment();
  }

  free(): void {
    this._inner.free();
  }
}

export class SmallWorldMetrics {
  private _inner: any;

  constructor(inner: any) {
    this._inner = inner;
  }

  get n(): bigint {
    return this._inner.n;
  }

  get m(): bigint {
    return this._inner.m;
  }

  get k(): number {
    return this._inner.k;
  }

  get clustering(): number {
    return this._inner.clustering;
  }

  get pathLength(): number {
    return this._inner.path_length;
  }

  get cRandom(): number {
    return this._inner.c_random;
  }

  get lRandom(): number {
    return this._inner.l_random;
  }

  gamma(): number {
    return this._inner.gamma();
  }

  lambda(): number {
    return this._inner.lambda();
  }

  sigma(): number {
    return this._inner.sigma();
  }

  isSmallWorld(): boolean {
    return this._inner.is_small_world() > 0.5;
  }

  interpretation(): string {
    return this._inner.interpretation();
  }

  free(): void {
    this._inner.free();
  }
}
