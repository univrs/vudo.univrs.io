/**
 * OutputPanel.tsx
 *
 * Display compilation results with success/error state styling
 * Shows output text with syntax highlighting for success messages
 * and error messages with line numbers when applicable
 */

import { motion, AnimatePresence } from "framer-motion";

interface OutputPanelProps {
  output: string;
  error: string | null;
  isCompiling: boolean;
  isExecuting?: boolean;
}

export function OutputPanel({ output, error, isCompiling, isExecuting = false }: OutputPanelProps) {
  const hasError = error !== null;
  const hasOutput = output.length > 0 || hasError;
  const isWorking = isCompiling || isExecuting;

  // Parse error for line numbers (format: "line X: error message")
  const parseError = (errorMsg: string) => {
    const lines = errorMsg.split("\n");
    return lines.map((line, index) => {
      const lineMatch = line.match(/^(line\s+\d+):\s*(.*)$/i);
      if (lineMatch) {
        return (
          <div key={index} className="flex gap-2">
            <span className="text-red-400/60 font-mono text-xs">
              {lineMatch[1]}
            </span>
            <span className="text-red-400">{lineMatch[2]}</span>
          </div>
        );
      }
      return (
        <div key={index} className="text-red-400">
          {line}
        </div>
      );
    });
  };

  // Highlight success output (checkmarks, arrows, tree symbols)
  const highlightOutput = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Checkmark lines
      if (line.includes("\u2713") || line.startsWith("\u2713")) {
        return (
          <div key={index} className="text-[#00ff88]">
            {line}
          </div>
        );
      }
      // Arrow/result lines
      if (line.startsWith("\u2192") || line.startsWith("->")) {
        return (
          <div key={index} className="text-cyan-400">
            {line}
          </div>
        );
      }
      // Tree branch lines
      if (
        line.includes("\u251c") ||
        line.includes("\u2514") ||
        line.includes("\u2502")
      ) {
        return (
          <div key={index} className="text-white/60">
            {line}
          </div>
        );
      }
      // Default
      return (
        <div key={index} className="text-[#00ff88]/80">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="relative h-full flex flex-col bg-[#0a0a0f] border border-white/10 rounded-sm overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
        <span className="text-xs text-white/50 font-mono tracking-wider uppercase">
          Output
        </span>
        <div className="flex items-center gap-2">
          {isWorking ? (
            <>
              <motion.div
                className="w-2 h-2 rounded-full bg-amber-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                }}
              />
              <span className="text-xs text-amber-400/80 font-mono">
                {isExecuting ? 'executing...' : 'compiling...'}
              </span>
            </>
          ) : hasError ? (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-red-400/80 font-mono">error</span>
            </>
          ) : hasOutput ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
              <span className="text-xs text-[#00ff88]/80 font-mono">
                success
              </span>
            </>
          ) : (
            <span className="text-xs text-white/30 font-mono">ready</span>
          )}
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {isWorking ? (
            <motion.div
              key="working"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full min-h-[120px]"
            >
              <div className="text-center">
                <motion.div
                  className="w-8 h-8 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full mx-auto mb-3"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <p className="text-white/40 text-sm font-mono">
                  {isExecuting ? 'Executing Spirit...' : 'Compiling to MLIR...'}
                </p>
              </div>
            </motion.div>
          ) : hasError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-sm leading-relaxed"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-500/20">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-400 text-xs uppercase tracking-wider">
                  Compilation Failed
                </span>
              </div>
              <div className="space-y-1">{parseError(error)}</div>
            </motion.div>
          ) : hasOutput ? (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-sm leading-relaxed whitespace-pre-wrap"
            >
              {highlightOutput(output)}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full min-h-[120px] text-white/30 text-sm font-mono"
            >
              Press Compile or Ctrl+Enter to run
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle glow effect for success state */}
      {hasOutput && !hasError && !isWorking && (
        <div className="absolute -inset-2 bg-[#00ff88]/5 blur-xl -z-10 rounded-lg pointer-events-none" />
      )}

      {/* Error glow effect */}
      {hasError && !isWorking && (
        <div className="absolute -inset-2 bg-red-500/5 blur-xl -z-10 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}

export default OutputPanel;
