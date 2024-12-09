'use client'

import CarList from '@/components/cars/CarList'
import { useAdmin } from '@/hooks/useAdmin'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const { isAdmin, loading } = useAdmin()
  const router = useRouter()

  // Force console log
  console.log('Admin Page Render:', { isAdmin, loading })

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return <div>Not authorized</div>
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-yellow-100 p-2 mb-4">
        Debug: isAdmin={String(isAdmin)}, loading={String(loading)}
      </div>
      <CarList isAdminPage={true} />
    </div>
  )
}