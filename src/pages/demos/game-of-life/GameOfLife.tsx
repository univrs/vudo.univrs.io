import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Configuration
const CONFIG = {
  gridSize: 100,
  cellSize: 8,
  wrapEdges: true,
  colors: { dead: '#1a1a2e', alive: '#00ff88' }
};

interface WasmModule {
  init: (width: number, height: number, wrap: boolean) => void;
  step: () => void;
  reset: () => void;
  randomize_grid: (density: number) => void;
  get_cells: () => Uint8Array;
  get_width: () => number;
  get_generation: () => number;
  get_alive_count: () => number;
  toggle_cell: (x: number, y: number) => void;
  set_cell_state: (x: number, y: number, state: boolean) => void;
  load_pattern: (pattern: string, x: number, y: number) => void;
}

export function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wasmRef = useRef<WasmModule | null>(null);
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [aliveCount, setAliveCount] = useState(0);
  const [speed, setSpeed] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);

  // Load WASM module
  useEffect(() => {
    async function loadWasm() {
      try {
        const wasmPath = '/demos/game-of-life/game_of_life_bg.wasm';
        const response = await fetch(wasmPath);

        if (!response.ok) {
          throw new Error(`Failed to fetch WASM: ${response.status}`);
        }

        const wasmBytes = await response.arrayBuffer();

        // Check WASM magic number
        const magic = new Uint8Array(wasmBytes.slice(0, 4));
        if (magic[0] !== 0x00 || magic[1] !== 0x61 || magic[2] !== 0x73 || magic[3] !== 0x6d) {
          throw new Error('Invalid WASM file');
        }

        const js = await import('/demos/game-of-life/game_of_life.js');
        await js.default(wasmBytes);

        wasmRef.current = js as unknown as WasmModule;
        wasmRef.current.init(CONFIG.gridSize, CONFIG.gridSize, CONFIG.wrapEdges);

        setLoading(false);
        render();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load WASM');
        setLoading(false);
      }
    }

    loadWasm();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const render = () => {
    const wasm = wasmRef.current;
    const canvas = canvasRef.current;
    if (!wasm || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cells = wasm.get_cells();
    const width = wasm.get_width();
    const cs = CONFIG.cellSize;

    ctx.fillStyle = CONFIG.colors.dead;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = CONFIG.colors.alive;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] === 1) {
        const x = (i % width) * cs;
        const y = Math.floor(i / width) * cs;
        ctx.fillRect(x, y, cs - 0.5, cs - 0.5);
      }
    }

    setGeneration(wasm.get_generation());
    setAliveCount(wasm.get_alive_count());
  };

  const gameLoop = (timestamp: number) => {
    if (!running) return;

    const elapsed = timestamp - lastFrameRef.current;
    const frameInterval = 1000 / speed;

    if (elapsed >= frameInterval && wasmRef.current) {
      wasmRef.current.step();
      render();
      lastFrameRef.current = timestamp - (elapsed % frameInterval);
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const toggleRunning = () => {
    if (!running) {
      setRunning(true);
      lastFrameRef.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      setRunning(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const step = () => {
    if (wasmRef.current) {
      wasmRef.current.step();
      render();
    }
  };

  const clear = () => {
    setRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (wasmRef.current) {
      wasmRef.current.reset();
      render();
    }
  };

  const randomize = () => {
    if (wasmRef.current) {
      wasmRef.current.randomize_grid(0.3);
      render();
    }
  };

  const loadPattern = (pattern: string) => {
    if (wasmRef.current) {
      const cx = Math.floor(CONFIG.gridSize / 2) - 5;
      const cy = Math.floor(CONFIG.gridSize / 2) - 5;
      wasmRef.current.load_pattern(pattern, cx, cy);
      render();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!wasmRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CONFIG.cellSize);
    const y = Math.floor((e.clientY - rect.top) / CONFIG.cellSize);
    wasmRef.current.toggle_cell(x, y);
    render();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)] text-sm tracking-widest uppercase">
            Loading Spirit...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl text-[#ff4444] mb-2">WASM Loading Error</h2>
          <p className="text-[var(--text-muted)] mb-4">{error}</p>
          <Link to="/" className="text-[#00ff88] hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="text-[var(--text-muted)] text-sm hover:text-[#00ff88] transition-colors mb-4 inline-block">
            ← Back to VUDO
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-[var(--text-primary)] mb-2">
            Game of Life Spirit
          </h1>
          <p className="text-[var(--text-muted)]">
            Conway's cellular automaton compiled from DOL to WASM
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0d0d1a] rounded-xl p-4 md:p-6 border border-[#00ff88]/20"
        >
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-4 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">Generation: </span>
              <span className="text-[#00ff88] font-mono">{generation}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Alive: </span>
              <span className="text-[#00ff88] font-mono">{aliveCount}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Grid: </span>
              <span className="text-[var(--text-primary)] font-mono">{CONFIG.gridSize}×{CONFIG.gridSize}</span>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={800}
              onClick={handleCanvasClick}
              className="rounded-lg cursor-crosshair max-w-full"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <button
              onClick={toggleRunning}
              className="px-4 py-2 bg-[#00ff88]/20 text-[#00ff88] rounded hover:bg-[#00ff88]/30 transition-colors"
            >
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button
              onClick={step}
              className="px-4 py-2 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded hover:bg-[#8b5cf6]/30 transition-colors"
            >
              ⏭ Step
            </button>
            <button
              onClick={clear}
              className="px-4 py-2 bg-[#ff4444]/20 text-[#ff4444] rounded hover:bg-[#ff4444]/30 transition-colors"
            >
              🗑 Clear
            </button>
            <button
              onClick={randomize}
              className="px-4 py-2 bg-[#fbbf24]/20 text-[#fbbf24] rounded hover:bg-[#fbbf24]/30 transition-colors"
            >
              🎲 Random
            </button>
          </div>

          {/* Speed control */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-[var(--text-muted)] text-sm">Speed:</span>
            <input
              type="range"
              min="1"
              max="60"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-32 accent-[#00ff88]"
            />
            <span className="text-[var(--text-primary)] font-mono text-sm w-8">{speed}</span>
          </div>

          {/* Pattern selector */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-[var(--text-muted)] text-sm self-center">Patterns:</span>
            {['glider', 'blinker', 'toad', 'beacon', 'pulsar', 'glider_gun'].map((pattern) => (
              <button
                key={pattern}
                onClick={() => loadPattern(pattern)}
                className="px-3 py-1 text-xs bg-[#1a1a2e] text-[var(--text-muted)] rounded hover:text-[#00ff88] hover:bg-[#1a1a2e]/80 transition-colors capitalize"
              >
                {pattern.replace('_', ' ')}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Source code link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <a
            href="/dol-source/game-of-life/Spirit.dol"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-muted)] text-sm hover:text-[#8b5cf6] transition-colors"
          >
            View DOL Source →
          </a>
        </motion.div>
      </div>
    </div>
  );
}
