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
        name: "Calculator",
        code: `// A Gen defines ontological structure
gen Calculator {
    calculator has value
    calculator has history
    calculator is stateful
}

docs {
    A Calculator gen stores a value and tracks history.
}

// Pure functions compile to WebAssembly
fun add(a: i64, b: i64) -> i64 {
    a + b
}

fun multiply(x: i64, y: i64) -> i64 {
    x * y
}

// Main entry point
fun main() -> i64 {
    let sum = add(40, 2)
    sum
}`,
    },
    {
        name: "Gen",
        code: `gen Counter {
    counter has value
    counter has timestamp
}

docs {
    A simple counter gen with value and timestamp.
}`,
    },
    {
        name: "Function",
        code: `fun add(a: i64, b: i64) -> i64 {
    a + b
}

fun multiply(x: i64, y: i64) -> i64 {
    x * y
}

fun main() -> i64 {
    add(40, 2)
}`,
    },
    {
        name: "Side Effect",
        code: `sex fun log_message(msg: string) {
    print(msg)
}`,
    },
    {
        name: "System",
        code: `system Counter @ 0.1.0 {
    requires base >= 0.0.1
    all counters is tracked
    each counter has identity
}

docs {
    A counter system that tracks all counter instances.
}`,
    },
    {
        name: "Trait",
        code: `trait Identifiable {
    entity has identity
    identity is unique
}

docs {
    Trait for entities that have unique identity.
}`,
    },
    {
        name: "Rule",
        code: `rule Positive {
    value is positive
    value never negative
}

docs {
    Ensures values are always positive.
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
    "gen",
    "gene",  // legacy support
    "spirit",
    "trait",
    "system",
    "rule",
    "constraint",  // legacy support
    "evo",
    "evolves",  // legacy support
    "docs",
    "exegesis",  // legacy support
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
    "forall",
    "exists",
    "mut",
    "let",
    "this",
    "pub",
]);

const TYPES = new Set([
    // v0.8.0 primitive types
    "i8",
    "i16",
    "i32",
    "i64",
    "u8",
    "u16",
    "u32",
    "u64",
    "f32",
    "f64",
    "bool",
    "string",
    // Legacy type names (for backwards compatibility)
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
    "Vec",
    "List",  // legacy
    "Self",
    // GDL (Geometric Deep Learning) types
    "Array",
    "Tuple",
    "Option",
    "SparseMatrix",
    "Graph",
    "PermutationGroup",
    "TranslationGroup",
    "SymmetryGroup",
    "Tensor",
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
// OUTPUT FORMATTING (metadol AST format)
// ═══════════════════════════════════════════════════════════════════

// metadol AST types
interface StatementNode {
    kind: string;
    subject?: string;
    property?: string;
    state?: string;
    name?: string;
    field_type?: string;
    default_value?: string;
    quantifier?: string;
    phrase?: string;
}

interface ASTNode {
    type: string;
    name?: string;
    version?: string;
    visibility?: string;
    purity?: string;
    params?: { name: string; param_type: string }[];
    return_type?: string;
    statements?: StatementNode[];
    exegesis?: string;
    line?: number;
}

interface ExecutionResult {
    functionName: string;
    args: number[];
    result: number | bigint | null;
    error?: string;
}

interface CompilerOutput {
    success: boolean;
    ast?: ASTNode[];
    errors?: { message: string; line: number; column: number }[];
    warnings?: string[];
    execution?: ExecutionResult[];
    bytecode?: Uint8Array | null;
    metadata?: {
        version: string;
        gene_count: number;
        trait_count: number;
        constraint_count: number;
        system_count: number;
        function_count: number;
        source_lines: number;
    };
}

function formatCompilerOutput(output: CompilerOutput | null, error: string | null, compileTime: number | null, _source: string): string {
    if (error) {
        return `✗ Compilation Error\n\n${error}`;
    }

    if (!output) {
        return "Waiting for compilation...";
    }

    // Handle parse errors
    if (!output.success && output.errors && output.errors.length > 0) {
        const err = output.errors[0];
        return `✗ Parse Error (line ${err.line}, col ${err.column})\n\n${err.message}`;
    }

    if (!output.ast || output.ast.length === 0) {
        return "✗ No declarations found";
    }

    const lines: string[] = [];
    const ast = output.ast;
    const metadata = output.metadata;

    // Format each top-level node
    for (const node of ast) {
        const visStr = node.visibility === "pub" ? "pub " : "";

        if (node.type === "Gene" || node.type === "Gen") {
            lines.push(`✓ ${visStr}gen ${node.name} validated`);
            formatStatements(node.statements || [], lines, "  ");
            if (node.exegesis) {
                lines.push(`  └─ docs: "${node.exegesis.slice(0, 40)}..."`);
            }
        } else if (node.type === "Trait") {
            lines.push(`✓ ${visStr}trait ${node.name} validated`);
            formatStatements(node.statements || [], lines, "  ");
            if (node.exegesis) {
                lines.push(`  └─ docs: "${node.exegesis.slice(0, 40)}..."`);
            }
        } else if (node.type === "Constraint" || node.type === "Rule") {
            lines.push(`✓ ${visStr}rule ${node.name} validated`);
            formatStatements(node.statements || [], lines, "  ");
            if (node.exegesis) {
                lines.push(`  └─ docs: "${node.exegesis.slice(0, 40)}..."`);
            }
        } else if (node.type === "System") {
            const versionStr = node.version ? ` @ ${node.version}` : "";
            lines.push(`✓ ${visStr}system ${node.name}${versionStr} validated`);
            formatStatements(node.statements || [], lines, "  ");
            if (node.exegesis) {
                lines.push(`  └─ docs: "${node.exegesis.slice(0, 40)}..."`);
            }
        } else if (node.type === "Function") {
            const purityStr = node.purity === "sex" ? "sex " : "";
            const paramsStr = node.params?.map(p => `${p.name}: ${p.param_type}`).join(", ") || "";
            const returnStr = node.return_type ? ` -> ${node.return_type}` : "";
            lines.push(`✓ ${visStr}${purityStr}fun ${node.name}(${paramsStr})${returnStr}`);
        } else if (node.type === "Const") {
            lines.push(`✓ ${visStr}const ${node.name}`);
        }
    }

    // Add compilation stats
    if (metadata) {
        lines.push("");
        lines.push("─".repeat(40));
        lines.push(`→ Compiler: DOL v${metadata.version}`);
        if (compileTime !== null) {
            lines.push(`→ Compiled in ${compileTime.toFixed(1)}ms`);
        }
        lines.push(`→ ${metadata.source_lines} lines parsed`);

        const counts = [];
        if (metadata.gene_count > 0) counts.push(`${metadata.gene_count} gen${metadata.gene_count > 1 ? 's' : ''}`);
        if (metadata.trait_count > 0) counts.push(`${metadata.trait_count} trait${metadata.trait_count > 1 ? 's' : ''}`);
        if (metadata.constraint_count > 0) counts.push(`${metadata.constraint_count} rule${metadata.constraint_count > 1 ? 's' : ''}`);
        if (metadata.system_count > 0) counts.push(`${metadata.system_count} system${metadata.system_count > 1 ? 's' : ''}`);
        if (metadata.function_count > 0) counts.push(`${metadata.function_count} function${metadata.function_count > 1 ? 's' : ''}`);

        if (counts.length > 0) {
            lines.push(`→ Found: ${counts.join(", ")}`);
        }
    }

    // Add warnings if any
    if (output.warnings && output.warnings.length > 0) {
        lines.push("");
        lines.push("⚠ Warnings:");
        for (const warning of output.warnings) {
            lines.push(`  ${warning}`);
        }
    }

    // Add WASM execution results
    if (output.execution && output.execution.length > 0) {
        lines.push("");
        lines.push("═".repeat(40));
        lines.push("⚡ WASM Execution Results");
        lines.push("─".repeat(40));

        for (const exec of output.execution) {
            if (exec.error) {
                lines.push(`✗ ${exec.functionName}() → error: ${exec.error}`);
            } else if (exec.result !== null) {
                if (exec.args.length > 0) {
                    lines.push(`▶ ${exec.functionName}(${exec.args.join(', ')}) → ${exec.result}`);
                } else {
                    lines.push(`▶ ${exec.functionName}() → ${exec.result}`);
                }
            }
        }
    } else if (output.bytecode && output.bytecode.length > 0) {
        // Bytecode was generated but not executed (shouldn't happen normally)
        lines.push("");
        lines.push(`→ WASM bytecode: ${output.bytecode.length} bytes`);
    }

    return lines.join("\n");
}

function formatStatements(statements: StatementNode[], lines: string[], indent: string) {
    const lastIdx = statements.length - 1;
    statements.forEach((stmt, i) => {
        const isLast = i === lastIdx;
        const prefix = isLast ? "└─" : "├─";

        if (stmt.kind === "Has") {
            lines.push(`${indent}${prefix} ${stmt.subject} has ${stmt.property}`);
        } else if (stmt.kind === "HasField") {
            const defaultStr = stmt.default_value ? ` = ${stmt.default_value}` : "";
            lines.push(`${indent}${prefix} has ${stmt.name}: ${stmt.field_type}${defaultStr}`);
        } else if (stmt.kind === "Is") {
            lines.push(`${indent}${prefix} ${stmt.subject} is ${stmt.state}`);
        } else if (stmt.kind === "Quantified") {
            lines.push(`${indent}${prefix} ${stmt.quantifier} ${stmt.phrase}`);
        } else if (stmt.kind === "Function") {
            lines.push(`${indent}${prefix} fun ${stmt.name}()`);
        } else if (stmt.kind === "Never") {
            lines.push(`${indent}${prefix} ${stmt.subject} never ${stmt.property}`);
        } else if (stmt.kind === "Requires") {
            lines.push(`${indent}${prefix} requires ${stmt.property}`);
        } else {
            lines.push(`${indent}${prefix} ${stmt.kind}`);
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
                                    DOL v0.8.0
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
                    DOL specifications compile via metadol → AST → WASM
                </motion.p>
            </div>
        </section>
    );
}

export default DOLPlayground;
