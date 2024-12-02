'use client'

import CarList from '@/components/cars/CarList'
import { useAdmin } from '@/hooks/useAdmin'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const isAdmin = useAdmin()
  const router = useRouter()

  useEffect(() => {
    console.log("Admin Check:", isAdmin)
    if (!isAdmin) {
      router.push('/')
    }
  }, [isAdmin, router])

  if (!isAdmin) return null

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <CarList isAdminPage={true} />
    </div>
  )
}