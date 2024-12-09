'use client'

import CarForm from '@/components/cars/CarForm'
import { useAuth } from '@/hooks/useAuth'

export default function CreatePage() {
  const { user } = useAuth()
  return (
    <div className="container mx-auto py-8">
      <CarForm />
    </div>
  )
}