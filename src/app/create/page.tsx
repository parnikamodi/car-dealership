'use client'

import CarForm from '@/components/cars/CarForm'

export default function CreatePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Car</h1>
      <CarForm />
    </div>
  )
}