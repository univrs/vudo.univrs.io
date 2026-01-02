// src/hooks/useCompiler.ts
import { useState, useCallback, useEffect, useRef } from 'react';

export type CompileStatus = 'idle' | 'compiling' | 'success' | 'error';

export interface CompileResult {
  bytecode: Uint8Array | null;
  messages: string[];
  ast?: object;
}

export interface UseCompilerReturn {
  compile: (source: string) => Promise<void>;
  status: CompileStatus;
  result: CompileResult | null;
  error: string | null;
  compileTime: number | null;
  isReady: boolean;
}

export function useCompiler(): UseCompilerReturn {
  const [status, setStatus] = useState<CompileStatus>('idle');
  const [result, setResult] = useState<CompileResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compileTime, setCompileTime] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/compiler.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (e) => {
        const { type, success, output, error: workerError, compileTime: time } = e.data;

        if (type === 'result') {
          setCompileTime(time);
          if (success) {
            setResult(output);
            setError(null);
            setStatus('success');
          } else {
            setResult(null);
            setError(workerError);
            setStatus('error');
          }
        }
      };

      workerRef.current.onerror = (e) => {
        console.error('Worker error:', e);
        setError('Compiler worker failed');
        setStatus('error');
      };

      setIsReady(true);
    } catch (err) {
      console.error('Failed to create worker:', err);
      setIsReady(false);
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const compile = useCallback(async (source: string) => {
    setStatus('compiling');
    setError(null);
    setResult(null);

    const requestId = `req-${++requestIdRef.current}`;

    if (workerRef.current && isReady) {
      // Use web worker
      workerRef.current.postMessage({
        type: 'compile',
        source,
        requestId,
      });
    } else {
      // Fallback to cloud API
      try {
        const response = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source }),
        });

        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setStatus('error');
        } else {
          setResult(data);
          setStatus('success');
        }
        setCompileTime(data.compileTime || null);
      } catch (err) {
        setError('Compilation failed: network error');
        setStatus('error');
      }
    }
  }, [isReady]);

  return {
    compile,
    status,
    result,
    error,
    compileTime,
    isReady,
  };
}
