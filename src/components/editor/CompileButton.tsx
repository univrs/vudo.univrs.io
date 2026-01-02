/**
 * CompileButton.tsx
 *
 * Stylized compile button with VUDO glow styling
 * Includes loading spinner and disabled state during compilation
 */

import { motion } from "framer-motion";

interface CompileButtonProps {
  onClick: () => void;
  isCompiling: boolean;
  disabled?: boolean;
}

export function CompileButton({
  onClick,
  isCompiling,
  disabled = false,
}: CompileButtonProps) {
  const isDisabled = disabled || isCompiling;

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative px-6 py-2.5 rounded-sm font-mono text-sm tracking-wider uppercase
        transition-all duration-300 min-w-[140px]
        ${
          isDisabled
            ? "bg-[#00ff88]/10 text-[#00ff88]/40 border border-[#00ff88]/20 cursor-not-allowed"
            : "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50 hover:bg-[#00ff88]/30 hover:border-[#00ff88]/70 hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]"
        }
      `}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
    >
      {/* Glow effect */}
      {!isDisabled && (
        <motion.div
          className="absolute -inset-1 bg-[#00ff88]/10 blur-md -z-10 rounded-sm"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <span className="flex items-center justify-center gap-2">
        {isCompiling ? (
          <>
            <motion.div
              className="w-4 h-4 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <span>Compiling</span>
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Compile</span>
          </>
        )}
      </span>
    </motion.button>
  );
}

export default CompileButton;
