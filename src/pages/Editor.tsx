import { useState, useCallback, useEffect, useMemo } from 'react';
import { DOLEditor } from '../components/editor/DOLEditor';
import { OutputPanel } from '../components/editor/OutputPanel';
import { StatusBar } from '../components/editor/StatusBar';
import { useCompiler, CompileStatus as HookCompileStatus } from '../hooks/useCompiler';
import { useIdentity } from '../hooks/useIdentity';
import { simulateExecution, ExecutionResult } from '../lib/sandbox';

const DEFAULT_CODE = `// My First Spirit
spirit HelloWorld {
  pub fn main() -> String {
    "Hello from the Mycelium! 🍄"
  }
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
        // Simulate execution since we have AST results
        const execResult = simulateExecution(result.ast);
        setExecutionResult(execResult);
        setIsExecuting(false);
      }
    }
  }, [compiler.status, compiler.result]);

  // Format the output from compilation result
  const output = useMemo(() => {
    if (!compiler.result) return '';

    const result = compiler.result as any;
    const lines: string[] = [];

    // Check if this is an AST result from the WASM compiler
    if (result.success !== undefined) {
      if (result.success) {
        lines.push('✓ Spirit compiled successfully');
        lines.push('');

        // Show metadata
        if (result.metadata) {
          lines.push(`→ Version: DOL ${result.metadata.version || '0.1.0'}`);
          lines.push(`→ Source lines: ${result.metadata.source_lines || 0}`);
          lines.push(`→ Spirits: ${result.metadata.spirit_count || 0}`);
          lines.push(`→ Functions: ${result.metadata.function_count || 0}`);
        }

        // Show AST summary
        if (result.ast && Array.isArray(result.ast)) {
          lines.push('');
          lines.push('AST Structure:');
          for (const node of result.ast) {
            if (node.type === 'Spirit') {
              lines.push(`├─ spirit ${node.name}`);
              if (node.body) {
                for (let i = 0; i < node.body.length; i++) {
                  const child = node.body[i];
                  const prefix = i === node.body.length - 1 ? '│  └─' : '│  ├─';
                  if (child.type === 'Function') {
                    lines.push(`${prefix} fn ${child.name}()`);
                  } else if (child.type === 'State') {
                    lines.push(`${prefix} state ${child.name}`);
                  } else if (child.type === 'Comment') {
                    lines.push(`${prefix} // comment`);
                  }
                }
              }
            } else if (node.type === 'Function') {
              lines.push(`├─ fn ${node.name}()`);
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
        <div className="flex-1 lg:w-1/2 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ml-2 text-xs text-white/40 font-mono">spirit.dol</span>
              </div>
              {nodeId && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 font-mono">node:</span>
                  <span className="text-xs text-[#00ff88]/60 font-mono" title={nodeId}>
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
