/**
 * DOLPlayground.tsx
 *
 * Interactive DOL editor with syntax highlighting and live compilation preview
 * Shows "Systems that know what they are" in action
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════════════════════════════════
// EXAMPLES
// ═══════════════════════════════════════════════════════════════════

interface Example {
    name: string;
    code: string;
    output: string;
}

const examples: Example[] = [
    {
        name: "Gene",
        code: `gene ProcessId {
  type: UInt64

  constraint positive {
    this.value > 0
  }

  exegesis {
    A process knows its identity.
  }
}`,
        output: `✓ Gene ProcessId validated
  ├─ type: UInt64 (64-bit unsigned)
  ├─ constraint: positive
  │   └─ this.value > 0
  └─ exegesis: attached

→ Compiled to MLIR: 42 bytes
→ Type: Gene<UInt64, [Positive]>`,
    },
    {
        name: "Pipeline",
        code: `gene Calculator {
  function transform(x: Int32) -> Int32 {
    return x
      |> double
      >> increment
      |> square
  }

  function double(n: Int32) -> Int32 {
    return n * 2
  }
}`,
        output: `✓ Gene Calculator validated
  ├─ function: transform
  │   └─ pipeline: double >> increment >> square
  ├─ function: double
  │   └─ body: n * 2
  └─ type inference: complete

→ Compiled to MLIR: 128 bytes
→ Pipeline optimized: 3 stages fused`,
    },
    {
        name: "Pattern Match",
        code: `gene Classifier {
  function classify(n: Int32) -> String {
    match n {
      0 { return "zero" }
      n where n > 0 {
        return "positive"
      }
      _ { return "negative" }
    }
  }
}`,
        output: `✓ Gene Classifier validated
  ├─ function: classify
  │   └─ match: exhaustive ✓
  │       ├─ case: 0 → "zero"
  │       ├─ case: n > 0 → "positive"
  │       └─ case: _ → "negative"
  └─ return type: String

→ Compiled to MLIR: 96 bytes
→ Match compiled to jump table`,
    },
    {
        name: "Trait",
        code: `trait Mappable<A, B> {
  requires {
    map: (A -> B) -> Self<B>
  }

  law identity {
    x.map(id) == x
  }

  law composition {
    x.map(f).map(g) == x.map(f >> g)
  }
}`,
        output: `✓ Trait Mappable<A, B> validated
  ├─ requires: map function
  │   └─ signature: (A -> B) -> Self<B>
  ├─ law: identity
  │   └─ x.map(id) == x
  └─ law: composition
      └─ fusion law verified

→ Functor instance derivable
→ Laws: machine-verifiable`,
    },
];

// ═══════════════════════════════════════════════════════════════════
// SYNTAX HIGHLIGHTING (Token-based)
// ═══════════════════════════════════════════════════════════════════

type TokenType =
    | "keyword"
    | "type"
    | "operator"
    | "string"
    | "number"
    | "comment"
    | "punctuation"
    | "text";

interface Token {
    type: TokenType;
    value: string;
}

const KEYWORDS = new Set([
    "gene",
    "trait",
    "system",
    "constraint",
    "evolves",
    "exegesis",
    "function",
    "return",
    "match",
    "if",
    "else",
    "for",
    "while",
    "loop",
    "break",
    "continue",
    "where",
    "in",
    "requires",
    "law",
    "type",
]);

const TYPES = new Set([
    "Int8",
    "Int16",
    "Int32",
    "Int64",
    "UInt8",
    "UInt16",
    "UInt32",
    "UInt64",
    "Float32",
    "Float64",
    "Bool",
    "String",
    "Void",
    "Self",
]);

const OPERATORS = [
    "|>",
    ">>",
    ":=",
    "<|",
    "->",
    "=>",
    "==",
    "!=",
    ">=",
    "<=",
    ">",
    "<",
    "+",
    "-",
    "*",
    "/",
];

function tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < code.length) {
        // Skip whitespace but preserve it
        if (/\s/.test(code[i])) {
            let ws = "";
            while (i < code.length && /\s/.test(code[i])) {
                ws += code[i];
                i++;
            }
            tokens.push({ type: "text", value: ws });
            continue;
        }

        // Comments
        if (code.slice(i, i + 2) === "//") {
            let comment = "";
            while (i < code.length && code[i] !== "\n") {
                comment += code[i];
                i++;
            }
            tokens.push({ type: "comment", value: comment });
            continue;
        }

        // Strings
        if (code[i] === '"') {
            let str = '"';
            i++;
            while (i < code.length && code[i] !== '"') {
                str += code[i];
                i++;
            }
            if (i < code.length) {
                str += '"';
                i++;
            }
            tokens.push({ type: "string", value: str });
            continue;
        }

        // Multi-char operators
        let foundOp = false;
        for (const op of OPERATORS) {
            if (code.slice(i, i + op.length) === op) {
                tokens.push({ type: "operator", value: op });
                i += op.length;
                foundOp = true;
                break;
            }
        }
        if (foundOp) continue;

        // Punctuation
        if (/[{}()\[\]:;,.<>|@#!?]/.test(code[i])) {
            tokens.push({ type: "punctuation", value: code[i] });
            i++;
            continue;
        }

        // Numbers
        if (/\d/.test(code[i])) {
            let num = "";
            while (i < code.length && /\d/.test(code[i])) {
                num += code[i];
                i++;
            }
            tokens.push({ type: "number", value: num });
            continue;
        }

        // Identifiers (keywords, types, or regular)
        if (/[a-zA-Z_]/.test(code[i])) {
            let ident = "";
            while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
                ident += code[i];
                i++;
            }
            if (KEYWORDS.has(ident)) {
                tokens.push({ type: "keyword", value: ident });
            } else if (TYPES.has(ident)) {
                tokens.push({ type: "type", value: ident });
            } else {
                tokens.push({ type: "text", value: ident });
            }
            continue;
        }

        // Anything else
        tokens.push({ type: "text", value: code[i] });
        i++;
    }

    return tokens;
}

function HighlightedCode({ code }: { code: string }) {
    const tokens = useMemo(() => tokenize(code), [code]);

    const colorMap: Record<TokenType, string> = {
        keyword: "text-violet-400",
        type: "text-emerald-400",
        operator: "text-cyan-400",
        string: "text-amber-400",
        number: "text-pink-400",
        comment: "text-white/40 italic",
        punctuation: "text-white/60",
        text: "text-white/90",
    };

    return (
        <pre className="text-sm leading-relaxed font-mono">
            <code>
                {tokens.map((token, i) => (
                    <span key={i} className={colorMap[token.type]}>
                        {token.value}
                    </span>
                ))}
            </code>
        </pre>
    );
}

// ═══════════════════════════════════════════════════════════════════
// TYPING ANIMATION
// ═══════════════════════════════════════════════════════════════════

function useTypingEffect(text: string, speed: number = 20) {
    const [displayed, setDisplayed] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayed("");
        setIsComplete(false);
        let i = 0;

        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                setIsComplete(true);
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed]);

    return { displayed, isComplete };
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function DOLPlayground() {
    const [activeExample, setActiveExample] = useState(0);
    const [isCompiling, setIsCompiling] = useState(false);
    const [showOutput, setShowOutput] = useState(false);

    const example = examples[activeExample];
    const { displayed: outputText, isComplete } = useTypingEffect(
        showOutput ? example.output : "",
        15,
    );

    // Simulate compilation
    const handleCompile = () => {
        setIsCompiling(true);
        setShowOutput(false);

        setTimeout(() => {
            setIsCompiling(false);
            setShowOutput(true);
        }, 800);
    };

    // Auto-compile on example change
    useEffect(() => {
        handleCompile();
    }, [activeExample]);

    return (
        <section className="relative py-32 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-sm tracking-[0.3em] uppercase text-[#00ff88]/80 mb-4">
                        Live Playground
                    </h2>
                    <p className="text-2xl md:text-3xl text-white/90 font-light">
                        See DOL in action
                    </p>
                </motion.div>

                {/* Example tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {examples.map((ex, i) => (
                        <button
                            key={ex.name}
                            onClick={() => setActiveExample(i)}
                            className={`px-4 py-2 text-sm rounded-sm transition-all duration-300 ${
                                i === activeExample
                                    ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50"
                                    : "bg-white/5 text-white/50 border border-white/10 hover:border-white/30"
                            }`}
                        >
                            {ex.name}
                        </button>
                    ))}
                </div>

                {/* Editor and Output */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Code Editor */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-[#0d0d14] border border-white/10 rounded-sm overflow-hidden">
                            {/* Editor header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    <span className="ml-3 text-xs text-white/40 font-mono">
                                        {example.name
                                            .toLowerCase()
                                            .replace(" ", "_")}
                                        .dol
                                    </span>
                                </div>
                                <span className="text-xs text-[#00ff88]/60 font-mono">
                                    DOL 2.0
                                </span>
                            </div>

                            {/* Code content */}
                            <div className="p-4 overflow-x-auto">
                                <HighlightedCode code={example.code} />
                            </div>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute -inset-2 bg-[#00ff88]/5 blur-xl -z-10 rounded-lg" />
                    </motion.div>

                    {/* Output Panel */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="bg-[#0d0d14] border border-white/10 rounded-sm overflow-hidden h-full">
                            {/* Output header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                                <span className="text-xs text-white/40 font-mono">
                                    Compilation Output
                                </span>
                                <div className="flex items-center gap-2">
                                    {isCompiling ? (
                                        <motion.div
                                            className="w-2 h-2 rounded-full bg-amber-400"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: Infinity,
                                            }}
                                        />
                                    ) : showOutput ? (
                                        <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                                    ) : null}
                                    <span className="text-xs text-white/40 font-mono">
                                        {isCompiling
                                            ? "compiling..."
                                            : showOutput
                                              ? "success"
                                              : ""}
                                    </span>
                                </div>
                            </div>

                            {/* Output content */}
                            <div className="p-4 min-h-[200px]">
                                <AnimatePresence mode="wait">
                                    {isCompiling ? (
                                        <motion.div
                                            key="compiling"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center justify-center h-full"
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
                                                <p className="text-white/40 text-sm">
                                                    Compiling to MLIR...
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.pre
                                            key="output"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm leading-relaxed font-mono text-[#00ff88]/80 whitespace-pre-wrap"
                                        >
                                            {outputText}
                                            {!isComplete && (
                                                <motion.span
                                                    animate={{
                                                        opacity: [1, 0],
                                                    }}
                                                    transition={{
                                                        duration: 0.5,
                                                        repeat: Infinity,
                                                    }}
                                                    className="inline-block w-2 h-4 bg-[#00ff88] ml-1"
                                                />
                                            )}
                                        </motion.pre>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute -inset-2 bg-[#8b5cf6]/5 blur-xl -z-10 rounded-lg" />
                    </motion.div>
                </div>

                {/* Caption */}
                <motion.p
                    className="text-center text-white/40 text-sm mt-8 italic"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                >
                    DOL specifications compile to MLIR → WASM → Native
                </motion.p>
            </div>
        </section>
    );
}

export default DOLPlayground;
