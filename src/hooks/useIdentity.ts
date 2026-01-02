// src/hooks/useIdentity.ts
import { useState, useEffect } from 'react';
import { Identity, getOrCreateIdentity } from '../lib/identity';

export interface UseIdentityReturn {
  identity: Identity | null;
  isLoading: boolean;
  error: string | null;
  nodeId: string | null;
}

export function useIdentity(): UseIdentityReturn {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const id = await getOrCreateIdentity();
        setIdentity(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize identity');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  return {
    identity,
    isLoading,
    error,
    nodeId: identity?.nodeId ?? null,
  };
}
