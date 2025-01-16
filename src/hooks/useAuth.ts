'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      setAuthState(prev => ({ ...prev, loading: false }))
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthState({
          user,
          loading: false,
          error: null
        })
      },
      (error) => {
        console.error('Auth state change error:', error)
        setAuthState({
          user: null,
          loading: false,
          error: error as Error
        })
      }
    )

    return () => unsubscribe()
  }, [])

  return authState
}