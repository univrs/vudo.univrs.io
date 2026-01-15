/**
 * DOLPlayground.tsx
 *
 * Interactive DOL editor with syntax highlighting and live compilation preview
 * Shows "Systems that know what they are" in action
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompiler } from "../hooks/useCompiler";

// ═══════════════════════════════════════════════════════════════════
// EXAMPLES
// ═══════════════════════════════════════════════════════════════════

interface Example {
    name: string;
    code: string;
}

const examples: Example[] = [
    {
        name: "Gene",
        code: `gene ProcessId {
  has value: Int

  constraint positive {
    this.value > 0
  }

  fun get() -> Int {
    return this.value
  }
}`,
    },
    {
        name: "Pipeline",
        code: `gene Calculator {
  fun transform(x: Int) -> Int {
    x
      |> double
      >> increment
      |> square
  }

  fun double(n: Int) -> Int {
    return n * 2
  }
}`,
    },
    {
        name: "Pattern Match",
        code: `gene Classifier {
  fun classify(n: Int) -> String {
    match n {
      0 => "zero"
      n if n > 0 => "positive"
      _ => "negative"
    }
  }
}`,
    },
    {
        name: "Spirit",
        code: `spirit Counter @0.1.0 {
  has value: Int = 0

  fun init() {
    this.value = 0
  }

  sex fun increment() {
    this.value = this.value + 1
  }

  fun get() -> Int {
    return this.value
  }
}`,
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
    "spirit",
    "trait",
    "system",
    "constraint",
    "evolves",
    "exegesis",
    "fun",
    "sex",
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
    "has",
    "mut",
    "let",
    "this",
    "pub",
]);

const TYPES = new Set([
    "Int",
    "Int8",
    "Int16",
    "Int32",
    "Int64",
    "UInt8",
    "UInt16",
    "UInt32",
    "UInt64",
    "Float",
    "Float32",
    "Float64",
    "Bool",
    "String",
    "Unit",
    "Any",
    "List",
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
        <pre className="text-xs sm:text-sm leading-relaxed font-mono">
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
// OUTPUT FORMATTING
// ═══════════════════════════════════════════════════════════════════

interface ASTNode {
    type: string;
    name?: string;
    version?: string;
    effectful?: boolean;
    field_type?: string;
    default_value?: string;
    params?: string[];
    return_type?: string;
    body?: ASTNode[];
    content?: string;
}

interface CompilerOutput {
    success: boolean;
    ast?: ASTNode[];
    messages?: string[];
    metadata?: {
        version: string;
        spirit_count: number;
        gene_count: number;
        function_count: number;
        field_count: number;
        constraint_count: number;
        source_lines: number;
    };
}

function formatCompilerOutput(output: CompilerOutput | null, error: string | null, compileTime: number | null, source: string): string {
    if (error) {
        return `✗ Compilation Error\n\n${error}`;
    }

    if (!output || !output.ast) {
        return "Waiting for compilation...";
    }

    const lines: string[] = [];
    const ast = output.ast;
    const metadata = output.metadata;

    // Format each top-level node
    for (const node of ast) {
        if (node.type === "Spirit") {
            const versionStr = node.version ? ` @${node.version}` : "";
            lines.push(`✓ Spirit ${node.name}${versionStr} validated`);
            formatBody(node.body || [], lines, "  ");
        } else if (node.type === "Gene") {
            lines.push(`✓ Gene ${node.name} validated`);
            formatBody(node.body || [], lines, "  ");
        } else if (node.type === "Function") {
            const effectStr = node.effectful ? " (effectful)" : "";
            const returnStr = node.return_type ? ` -> ${node.return_type}` : "";
            lines.push(`✓ fun ${node.name}()${returnStr}${effectStr}`);
        }
    }

    // Add compilation stats
    if (metadata) {
        lines.push("");
        lines.push(`→ Compiler: DOL v${metadata.version}`);
        if (compileTime !== null) {
            lines.push(`→ Compiled in ${compileTime.toFixed(1)}ms`);
        }
    }

    // Simulate execution
    lines.push("");
    lines.push("─".repeat(40));
    lines.push("▶ Execution:");

    const execResult = simulateExecution(source, ast);
    lines.push(...execResult);

    return lines.join("\n");
}

// Simple DOL execution simulator
function simulateExecution(source: string, ast: ASTNode[]): string[] {
    const lines: string[] = [];

    // Find gene and extract info
    const gene = ast.find(n => n.type === "Gene" || n.type === "Spirit");
    if (!gene) {
        lines.push("  (no gene/spirit to execute)");
        return lines;
    }

    // Parse initial value from source: "let c = Counter { value: X }"
    const initMatch = source.match(/let\s+\w+\s*=\s*\w+\s*\{\s*value\s*:\s*(\d+)/);
    let value = initMatch ? parseInt(initMatch[1], 10) : 0;

    // Parse increment expression from source: "this.value = this.value + X"
    const incrMatch = source.match(/this\.value\s*=\s*this\.value\s*\+\s*(\d+)/);
    const increment = incrMatch ? parseInt(incrMatch[1], 10) : 1;

    // Count how many times increment is called
    const callMatches = source.match(/\.increment\(\)/g);
    const callCount = callMatches ? callMatches.length : 0;

    lines.push(`  ⧬ ${gene.name} instantiated with value: ${value}`);

    for (let i = 0; i < callCount; i++) {
        const oldValue = value;
        value += increment;
        lines.push(`  → increment() called: ${oldValue} + ${increment} = ${value}`);
    }

    // Check for get() call
    if (source.includes(".get()")) {
        lines.push(`  → get() returns: ${value}`);
    }

    // Check for println
    if (source.includes("println")) {
        lines.push(`  📤 Output: ${value}`);
    }

    lines.push("");
    lines.push(`✓ Final value: ${value}`);

    return lines;
}

function formatBody(body: ASTNode[], lines: string[], indent: string) {
    const lastIdx = body.length - 1;
    body.forEach((node, i) => {
        const isLast = i === lastIdx;
        const prefix = isLast ? "└─" : "├─";

        if (node.type === "Field") {
            const defaultStr = node.default_value ? ` = ${node.default_value}` : "";
            lines.push(`${indent}${prefix} has: ${node.name} (${node.field_type})${defaultStr}`);
        } else if (node.type === "Constraint") {
            lines.push(`${indent}${prefix} constraint: ${node.name}`);
        } else if (node.type === "Function") {
            const effectStr = node.effectful ? " [effectful]" : "";
            const returnStr = node.return_type ? ` -> ${node.return_type}` : "";
            lines.push(`${indent}${prefix} fun: ${node.name}()${returnStr}${effectStr}`);
        } else if (node.type === "Exegesis") {
            lines.push(`${indent}${prefix} exegesis: "${node.content?.slice(0, 30)}..."`);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function DOLPlayground() {
    const [activeExample, setActiveExample] = useState(0);
    const [code, setCode] = useState(examples[0].code);
    const { compile, status, result, error, compileTime, isReady } = useCompiler();

    // Format output from compiler result
    const formattedOutput = useMemo(() => {
        if (status === 'idle' || status === 'compiling') return "";
        return formatCompilerOutput(result as CompilerOutput | null, error, compileTime, code);
    }, [result, error, compileTime, status, code]);

    const { displayed: outputText, isComplete } = useTypingEffect(
        status === 'success' || status === 'error' ? formattedOutput : "",
        15,
    );

    // Compile the current code
    const handleCompile = useCallback(() => {
        compile(code);
    }, [compile, code]);

    // When example tab changes, update the code
    useEffect(() => {
        setCode(examples[activeExample].code);
    }, [activeExample]);

    // Auto-compile when code changes (debounced) or compiler becomes ready
    useEffect(() => {
        if (!isReady) return;

        const timer = setTimeout(() => {
            handleCompile();
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [code, isReady, handleCompile]);

    return (
        <section className="relative py-16 md:py-32 px-4 md:px-6">
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
                            className={`px-4 py-2 text-sm rounded-sm transition-all duration-300 min-h-[44px] ${
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
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
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
                                        {examples[activeExample].name
                                            .toLowerCase()
                                            .replace(" ", "_")}
                                        .dol
                                    </span>
                                </div>
                                <span className="text-xs text-[#00ff88]/60 font-mono">
                                    DOL v0.7.0
                                </span>
                            </div>

                            {/* Code editor - editable textarea */}
                            <div className="relative">
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full h-[280px] p-4 bg-transparent text-white/90 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none"
                                    spellCheck={false}
                                    style={{ tabSize: 2 }}
                                />
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
                                    {status === 'compiling' ? (
                                        <motion.div
                                            className="w-2 h-2 rounded-full bg-amber-400"
                                            animate={{ opacity: [1, 0.3, 1] }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: Infinity,
                                            }}
                                        />
                                    ) : status === 'success' ? (
                                        <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                                    ) : status === 'error' ? (
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                    ) : null}
                                    <span className="text-xs text-white/40 font-mono">
                                        {status === 'compiling'
                                            ? "compiling..."
                                            : status === 'success'
                                              ? "success"
                                              : status === 'error'
                                                ? "error"
                                                : ""}
                                    </span>
                                </div>
                            </div>

                            {/* Output content */}
                            <div className="p-4 min-h-[150px] md:min-h-[200px]">
                                <AnimatePresence mode="wait">
                                    {status === 'compiling' ? (
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
                                            className={`text-sm leading-relaxed font-mono whitespace-pre-wrap ${
                                                status === 'error' ? 'text-red-400/80' : 'text-[#00ff88]/80'
                                            }`}
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
                                                    className={`inline-block w-2 h-4 ml-1 ${
                                                        status === 'error' ? 'bg-red-400' : 'bg-[#00ff88]'
                                                    }`}
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
