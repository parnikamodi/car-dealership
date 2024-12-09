'use client'

import CarList from '@/components/cars/CarList'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Car Listings Section */}
      <div className="p-5">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Available Cars</h1>
          <p className="text-gray-600 mt-2">
            Browse through our collection of quality vehicles
          </p>
        </div>

        {/* CarList Component */}
        <CarList />
      </div>
    </div>
  )
}