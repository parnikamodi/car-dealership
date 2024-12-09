'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export function useAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid))
        setIsAdmin(adminDoc.exists())
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  return isAdmin
}
