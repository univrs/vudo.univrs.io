/**
 * StatusBar.tsx
 *
 * Bottom bar for the editor with compile button, status text,
 * language indicator, and keyboard shortcut hints
 */

import { motion } from "framer-motion";
import { CompileButton } from "./CompileButton";

interface StatusBarProps {
  onCompile: () => void;
  status: "ready" | "compiling" | "success" | "error";
  compileTime?: number;
  error?: string;
}

export function StatusBar({
  onCompile,
  status,
  compileTime,
  error,
}: StatusBarProps) {
  const getStatusText = () => {
    switch (status) {
      case "ready":
        return { text: "Ready", color: "text-[var(--text-muted)]" };
      case "compiling":
        return { text: "Compiling...", color: "text-amber-500" };
      case "success":
        return {
          text: compileTime ? `Compiled in ${compileTime}ms` : "Compiled",
          color: "text-[var(--glow-green)]",
        };
      case "error":
        return {
          text: error ? `Error: ${error.slice(0, 50)}${error.length > 50 ? "..." : ""}` : "Error",
          color: "text-red-500",
        };
      default:
        return { text: "Ready", color: "text-[var(--text-muted)]" };
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)]/95 border-t border-[var(--border-color)] backdrop-blur-sm">
      {/* Left side: Compile button and status */}
      <div className="flex items-center gap-4">
        <CompileButton onClick={onCompile} isCompiling={status === "compiling"} />

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${
              status === "ready"
                ? "bg-[var(--text-muted)]"
                : status === "compiling"
                  ? "bg-amber-400"
                  : status === "success"
                    ? "bg-[var(--glow-green)]"
                    : "bg-red-500"
            }`}
            animate={
              status === "compiling"
                ? { opacity: [1, 0.3, 1] }
                : { opacity: 1 }
            }
            transition={
              status === "compiling"
                ? { duration: 0.6, repeat: Infinity }
                : undefined
            }
          />
          <span className={`text-sm font-mono ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      {/* Right side: Language indicator and shortcuts */}
      <div className="flex items-center gap-6">
        {/* Keyboard shortcut hint */}
        <div className="hidden sm:flex items-center gap-2 text-[var(--text-muted)] text-xs font-mono">
          <kbd className="px-1.5 py-0.5 bg-[var(--border-color)] border border-[var(--border-color)] rounded text-[var(--text-muted)]">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-[var(--border-color)] border border-[var(--border-color)] rounded text-[var(--text-muted)]">
            Enter
          </kbd>
          <span className="ml-1">to compile</span>
        </div>

        {/* Language indicator */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--border-color)] border border-[var(--border-color)] rounded-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--glow-green)]" />
          <span className="text-xs font-mono text-[var(--text-muted)] tracking-wider">
            DOL 2.0
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
