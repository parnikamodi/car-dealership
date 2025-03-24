'use client'

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { initializeNewUser } from '@/lib/firebase/userInitialization';

export function useInitializeUser() {
  const { user, loading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initialize() {
      if (user && !loading && !isInitialized) {
        setIsInitializing(true);
        try {
          await initializeNewUser(user);
          setIsInitialized(true);
          setError(null);
        } catch (err) {
          setError(err as Error);
        } finally {
          setIsInitializing(false);
        }
      }
    }

    initialize();
  }, [user, loading, isInitialized]);

  return { isInitializing, error, isInitialized };
}