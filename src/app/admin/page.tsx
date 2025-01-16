'use client'

import CarList from '@/components/cars/CarList'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return null
  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <CarList isAdminPage={true} />
    </div>
  )
}