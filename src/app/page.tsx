'use client'

import CarList from '@/components/cars/CarList'
import { useState } from 'react'

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('all')

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'live', label: 'Live' },
    { id: 'processing', label: 'Processing' },
    { id: 'limited', label: 'Limited' }
  ]

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Filter tabs */}
      <div className="flex gap-3 p-5 border-b bg-white sticky top-16 shadow-sm overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-5 py-1.5 rounded-full transition-colors ${
              activeFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'border hover:bg-gray-50 hover:border-blue-300'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Car Listings Section */}
      <div className="p-5">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Available Cars</h1>
          <p className="text-gray-600 mt-2">
            Browse through our collection of quality vehicles
          </p>
        </div>

        {/* CarList Component */}
        <CarList filter={activeFilter} />
      </div>
    </div>
  )
}