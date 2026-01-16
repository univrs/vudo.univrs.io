import { useState, useCallback, useEffect, useMemo } from 'react';
import { DOLEditor } from '../components/editor/DOLEditor';
import { OutputPanel } from '../components/editor/OutputPanel';
import { StatusBar } from '../components/editor/StatusBar';
import { useCompiler, CompileStatus as HookCompileStatus } from '../hooks/useCompiler';
import { useIdentity } from '../hooks/useIdentity';
import { simulateExecution, ExecutionResult } from '../lib/sandbox';

const DEFAULT_CODE = `// Define a Gene (ontological data structure)
gene Counter {
    counter has value
    counter has timestamp
}

exegesis {
    A Counter gene tracks a numeric value and when it was updated.
}

// Define a pure function (compiles to WASM)
fun add(a: Int64, b: Int64) -> Int64 {
    return a + b
}

// Define a function with side effects
sex fun log_event(message: String) {
    emit log_event(message)
}

// Define a trait (behavioral contract)
trait Incrementable {
    incrementable is stateful
    incrementable requires identity
}

// Define a system (coordinated behavior)
system counter.system @0.1.0 {
    requires Counter >= 0.1.0
    uses Incrementable
    counterSystem has active_state
}`;

type CompileStatus = 'ready' | 'compiling' | 'success' | 'error';

// Map hook status to component status
function mapStatus(hookStatus: HookCompileStatus): CompileStatus {
  if (hookStatus === 'idle') return 'ready';
  return hookStatus;
}

export function Editor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const compiler = useCompiler();
  const { nodeId, isLoading: identityLoading } = useIdentity();
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Map compiler status to component status
  const status = mapStatus(compiler.status);
  const error = compiler.error;
  const compileTime = compiler.compileTime ?? undefined;

  // Auto-execute after successful compilation
  useEffect(() => {
    if (compiler.status === 'success' && compiler.result) {
      const result = compiler.result as any;
      if (result.success && result.ast) {
        setIsExecuting(true);
        // Simulate execution with source code for accurate values
        const execResult = simulateExecution(result.ast, code);
        setExecutionResult(execResult);
        setIsExecuting(false);
      }
    }
  }, [compiler.status, compiler.result, code]);

  // Format the output from compilation result
  const output = useMemo(() => {
    if (!compiler.result) return '';

    const result = compiler.result as any;
    const lines: string[] = [];

    // Check if this is an AST result from the WASM compiler
    if (result.success !== undefined) {
      if (result.success) {
        lines.push('✓ Compiled successfully');
        lines.push('');

        // Show metadata
        if (result.metadata) {
          lines.push(`→ Version: DOL ${result.metadata.version || '0.1.0'}`);
          lines.push(`→ Source lines: ${result.metadata.source_lines || 0}`);
          if (result.metadata.spirit_count > 0) {
            lines.push(`→ Spirits: ${result.metadata.spirit_count}`);
          }
          if (result.metadata.gene_count > 0) {
            lines.push(`→ Genes: ${result.metadata.gene_count}`);
          }
          if (result.metadata.function_count > 0) {
            lines.push(`→ Functions: ${result.metadata.function_count}`);
          }
        }

        // Show AST summary (handles metadol AST format)
        if (result.ast && Array.isArray(result.ast)) {
          lines.push('');
          lines.push('AST Structure:');
          for (const node of result.ast) {
            const nodeType = node.type?.toLowerCase() || 'unknown';
            const nodeName = node.name || 'anonymous';

            // Handle different declaration types from metadol
            if (nodeType === 'gene') {
              lines.push(`├─ gene ${nodeName}`);
              const statements = node.statements || node.body || [];
              for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                const prefix = i === statements.length - 1 ? '│  └─' : '│  ├─';
                if (stmt.kind === 'Has' || stmt.type === 'Has') {
                  lines.push(`${prefix} ${stmt.subject || ''} has ${stmt.property || stmt.name || ''}`);
                } else if (stmt.kind === 'HasField' || stmt.type === 'HasField') {
                  lines.push(`${prefix} has ${stmt.name || ''}: ${stmt.field_type || ''}`);
                } else if (stmt.kind === 'Is' || stmt.type === 'Is') {
                  lines.push(`${prefix} ${stmt.subject || ''} is ${stmt.state || ''}`);
                }
              }
            } else if (nodeType === 'trait') {
              lines.push(`├─ trait ${nodeName}`);
              const statements = node.statements || node.body || [];
              for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                const prefix = i === statements.length - 1 ? '│  └─' : '│  ├─';
                if (stmt.kind === 'Is' || stmt.type === 'Is') {
                  lines.push(`${prefix} ${stmt.subject || ''} is ${stmt.state || ''}`);
                } else if (stmt.kind === 'Requires' || stmt.type === 'Requires') {
                  lines.push(`${prefix} ${stmt.subject || ''} requires ${stmt.requirement || ''}`);
                }
              }
            } else if (nodeType === 'constraint') {
              lines.push(`├─ constraint ${nodeName}`);
              const statements = node.statements || node.body || [];
              for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                const prefix = i === statements.length - 1 ? '│  └─' : '│  ├─';
                if (stmt.kind === 'Never' || stmt.type === 'Never') {
                  lines.push(`${prefix} never ${stmt.condition || ''}`);
                } else if (stmt.kind === 'Requires' || stmt.type === 'Requires') {
                  lines.push(`${prefix} requires ${stmt.requirement || ''}`);
                }
              }
            } else if (nodeType === 'system') {
              lines.push(`├─ system ${nodeName}`);
              // Show requirements if present
              if (node.requirements && node.requirements.length > 0) {
                for (const req of node.requirements) {
                  lines.push(`│  ├─ requires ${req.name || req.requirement || ''} ${req.version_constraint || ''}`);
                }
              }
              const statements = node.statements || node.body || [];
              for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                const prefix = i === statements.length - 1 ? '│  └─' : '│  ├─';
                if (stmt.kind === 'Uses' || stmt.type === 'Uses') {
                  lines.push(`${prefix} uses ${stmt.reference || stmt.target || stmt.name || ''}`);
                } else if (stmt.kind === 'Matches' || stmt.type === 'Matches') {
                  lines.push(`${prefix} matches ${stmt.pattern || stmt.name || ''}`);
                } else if (stmt.kind === 'Emits' || stmt.type === 'Emits') {
                  lines.push(`${prefix} emits ${stmt.event || stmt.name || ''}`);
                } else if (stmt.kind === 'Has' || stmt.type === 'Has') {
                  lines.push(`${prefix} ${stmt.subject || ''} has ${stmt.property || ''}`);
                }
              }
            } else if (nodeType === 'function') {
              const purity = node.purity === 'SideEffect' ? 'sex fun' : 'fun';
              const formatType = (t: any): string => {
                if (!t) return '';
                if (typeof t === 'string') return t;
                if (t.Named) return t.Named;
                if (t.name) return t.name;
                return String(t);
              };
              const params = node.params?.map((p: any) => `${p.name}: ${formatType(p.param_type)}`).join(', ') || '';
              const retType = node.return_type ? ` -> ${formatType(node.return_type)}` : '';
              lines.push(`├─ ${purity} ${nodeName}(${params})${retType}`);
            } else if (nodeType === 'spirit') {
              lines.push(`├─ spirit ${nodeName}`);
            } else {
              lines.push(`├─ ${nodeType} ${nodeName}`);
            }

            // Show exegesis if present
            if (node.exegesis) {
              lines.push(`│  └─ exegesis: "${node.exegesis.slice(0, 50)}${node.exegesis.length > 50 ? '...' : ''}"`);
            }
          }
        }

        // Show warnings
        if (result.warnings && result.warnings.length > 0) {
          lines.push('');
          lines.push('Warnings:');
          for (const warning of result.warnings) {
            lines.push(`⚠ ${warning}`);
          }
        }

        // Show compile time
        if (compileTime) {
          lines.push('');
          lines.push(`→ Compile time: ${compileTime.toFixed(1)}ms`);
        }

        // Add execution results if available
        if (executionResult) {
          lines.push('');
          lines.push('─'.repeat(40));
          lines.push('');
          if (executionResult.success) {
            lines.push('▶ Execution:');
            lines.push(executionResult.output);
            lines.push(`→ Execution time: ${executionResult.executionTime.toFixed(1)}ms`);
          } else {
            lines.push('✗ Execution failed:');
            lines.push(executionResult.error || 'Unknown error');
          }
        }
      } else {
        // Compilation failed - show errors
        lines.push('✗ Compilation failed');
        lines.push('');
        if (result.errors && result.errors.length > 0) {
          lines.push('Errors:');
          for (const err of result.errors) {
            if (typeof err === 'string') {
              lines.push(`  • ${err}`);
            } else if (err.message) {
              const location = err.line ? ` (line ${err.line}${err.column ? `:${err.column}` : ''})` : '';
              lines.push(`  • ${err.message}${location}`);
            } else {
              lines.push(`  • ${JSON.stringify(err)}`);
            }
          }
        }
      }
    } else if (result.messages) {
      // Fallback format from cloud API or worker fallback
      lines.push('✓ Compilation complete');
      lines.push('');
      for (const msg of result.messages) {
        lines.push(`→ ${msg}`);
      }
      if (compileTime) {
        lines.push(`→ Compile time: ${compileTime.toFixed(1)}ms`);
      }
    }

    return lines.join('\n');
  }, [compiler.result, compileTime, executionResult]);

  // Handle compile button click
  const handleCompile = useCallback(() => {
    setExecutionResult(null); // Clear previous execution
    compiler.compile(code);
  }, [compiler, code]);

  // Auto-compile on page load when compiler is ready
  useEffect(() => {
    if (compiler.isReady && compiler.status === 'idle') {
      // Small delay to ensure WASM is fully initialized
      const timer = setTimeout(() => {
        compiler.compile(code);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [compiler.isReady]); // Only run once when compiler becomes ready

  // Keyboard shortcut: Ctrl+Enter to compile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCompile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCompile]);

  return (
    <div className="pt-14 h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Main editor area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Code Editor */}
        <div className="flex-1 lg:w-1/2 border-b lg:border-b-0 lg:border-r border-[var(--border-color)]">
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 bg-[var(--border-color)] border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ml-2 text-xs text-[var(--text-muted)] font-mono">gene.dol</span>
              </div>
              {nodeId && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] font-mono">node:</span>
                  <span className="text-xs text-[var(--glow-green)]/60 font-mono" title={nodeId}>
                    {nodeId.slice(0, 8)}...{nodeId.slice(-4)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <DOLEditor value={code} onChange={setCode} />
            </div>
          </div>
        </div>

        {/* Right: Output Panel */}
        <div className="flex-1 lg:w-1/2">
          <OutputPanel
            output={output}
            error={error}
            isCompiling={status === 'compiling'}
            isExecuting={isExecuting}
          />
        </div>
      </div>

      {/* Bottom: Status Bar */}
      <StatusBar
        onCompile={handleCompile}
        status={status}
        compileTime={compileTime}
        error={error || undefined}
      />
    </div>
  );
}
