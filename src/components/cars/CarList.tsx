'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase/config'
import CarCard from './CarCard'
import type { Car } from '@/lib/types/car'

export default function CarList() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'none' | 'high' | 'low'>('none')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      setError(null)

      try {
        const carsRef = collection(db, 'cars')
        const q = query(carsRef, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)

        const carsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Car[]

        setCars(carsData)
      } catch (error) {
        console.error('Error fetching cars:', error)
        setError('Failed to load cars. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  const handleDelete = async (carId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return

    try {
      const carDoc = await getDoc(doc(db, 'cars', carId))
      const carData = carDoc.data()

      if (carData?.imagePaths) {
        await Promise.all(
          carData.imagePaths.map(async (path: string) => {
            const imageRef = ref(storage, path)
            await deleteObject(imageRef)
          })
        )
      }

      await deleteDoc(doc(db, 'cars', carId))
      setCars(prevCars => prevCars.filter(car => car.id !== carId))
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Error deleting listing')
    }
  }

  const sortedCars = [...cars].sort((a, b) => {
    if (sortOrder === 'high') {
      return b.price - a.price
    } else if (sortOrder === 'low') {
      return a.price - b.price
    }
    return 0
  })

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(n => (
          <div key={n} className="bg-white p-4 border-b border-gray-200">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No cars available at the moment.</p>
        <p className="text-sm text-gray-500 mt-2">Please check back later for new listings.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter and Sort Options */}
      <div className="mb-6 flex gap-4 justify-between items-center">
        <div className="text-sm text-gray-600">Result: {cars.length} ad(s)</div>
        <div className="flex gap-4">
          <button
            onClick={() => setSortOrder('high')}
            className={`px-4 py-2 rounded transition ${
              sortOrder === 'high'
                ? 'bg-black text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Highest Price
          </button>
          <button
            onClick={() => setSortOrder('low')}
            className={`px-4 py-2 rounded transition ${
              sortOrder === 'low'
                ? 'bg-black text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Lowest Price
          </button>
        </div>
      </div>

      {/* Car Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCars.map(car => (
          <CarCard 
            key={car.id} 
            car={car} 
            onDelete={() => handleDelete(car.id)} 
          />
        ))}
      </div>
    </div>
  )
}
