'use client'

import { useState, useEffect } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if running on client side
    if (typeof window !== 'undefined') {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
        setLoading(false)
      }, (error) => {
        console.error('Auth state change error:', error)
        setUser(null)
        setLoading(false)
      })

      return () => unsubscribe()
    } else {
      // If on server side, set loading to false
      setLoading(false)
    }
  }, [])

  return { user, loading }
}