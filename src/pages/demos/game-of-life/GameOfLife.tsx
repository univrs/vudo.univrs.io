import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import initWasm, * as wasmBindings from '../../../wasm/game-of-life/game_of_life.js';

// Configuration
const CONFIG = {
  gridSize: 100,
  cellSize: 8,
  wrapEdges: true,
  colors: { dead: '#1a1a2e', alive: '#00ff88' }
};

export function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wasmReady, setWasmReady] = useState(false);
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
        // Initialize WASM with binary from public directory
        await initWasm('/demos/game-of-life/game_of_life_bg.wasm');
        wasmBindings.init(CONFIG.gridSize, CONFIG.gridSize, CONFIG.wrapEdges);
        setWasmReady(true);
        setLoading(false);
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

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!wasmReady || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cells = wasmBindings.get_cells();
    const width = wasmBindings.get_width();
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

    setGeneration(Number(wasmBindings.get_generation()));
    setAliveCount(Number(wasmBindings.get_alive_count()));
  }, [wasmReady]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!running || !wasmReady) return;

    const elapsed = timestamp - lastFrameRef.current;
    const frameInterval = 1000 / speed;

    if (elapsed >= frameInterval) {
      wasmBindings.step();
      render();
      lastFrameRef.current = timestamp - (elapsed % frameInterval);
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [running, wasmReady, speed, render]);

  // Initial render when WASM is ready
  useEffect(() => {
    if (wasmReady) {
      render();
    }
  }, [wasmReady, render]);

  // Handle animation loop
  useEffect(() => {
    if (running && wasmReady) {
      lastFrameRef.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, wasmReady, gameLoop]);

  const toggleRunning = () => {
    setRunning(!running);
  };

  const step = () => {
    if (wasmReady) {
      wasmBindings.step();
      render();
    }
  };

  const clear = () => {
    setRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (wasmReady) {
      wasmBindings.reset();
      render();
    }
  };

  const randomize = () => {
    if (wasmReady) {
      wasmBindings.randomize_grid(0.3);
      render();
    }
  };

  const loadPattern = (pattern: string) => {
    if (wasmReady) {
      const cx = Math.floor(CONFIG.gridSize / 2) - 5;
      const cy = Math.floor(CONFIG.gridSize / 2) - 5;
      wasmBindings.load_pattern(pattern, cx, cy);
      render();
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!wasmReady || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CONFIG.cellSize);
    const y = Math.floor((e.clientY - rect.top) / CONFIG.cellSize);
    wasmBindings.toggle_cell(x, y);
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

        {/* Source code links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-[#0d0d1a]/50 rounded-xl border border-[#8b5cf6]/20"
        >
          <h3 className="text-center text-[var(--text-primary)] mb-4">Built with DOL</h3>
          <p className="text-center text-[var(--text-muted)] text-sm mb-4">
            This demo is compiled from DOL (Domain Ontology Language) source code to WebAssembly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/univrs/dol/tree/main/examples/spirits/game-of-life"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded hover:bg-[#8b5cf6]/30 transition-colors text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
            <a
              href="/dol-source/game-of-life/Spirit.dol"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#00ff88]/20 text-[#00ff88] rounded hover:bg-[#00ff88]/30 transition-colors text-sm"
            >
              View Spirit.dol
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
