'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, deleteDoc, doc, getDoc, where, Query } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase/config'
import CarCard from './CarCard'
import type { Car } from '@/lib/types/car'

export interface CarListProps {
  isAdminPage?: boolean;
  filter?: string;
}

export default function CarList({ isAdminPage = false, filter = 'all' }: CarListProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'none' | 'high' | 'low'>('none')
  const [error, setError] = useState<string | null>(null)

  // Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      setError(null)

      try {
        const carsRef = collection(db, 'cars')
        let q: Query = query(carsRef, orderBy('createdAt', 'desc'))

        // Apply filter if not 'all'
        if (filter !== 'all') {
          q = query(carsRef, 
            where('status', '==', filter),
            orderBy('createdAt', 'desc')
          )
        }

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
  }, [filter]) // Added filter to dependency array

  // Handle car deletion
  const handleDelete = async (carId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return

    try {
      // Fetch car data to delete associated images
      const carDoc = await getDoc(doc(db, 'cars', carId))
      const carData = carDoc.data()

      if (carData?.imagePaths) {
        // Delete images from storage
        await Promise.all(
          carData.imagePaths.map(async (path: string) => {
            const imageRef = ref(storage, path)
            await deleteObject(imageRef)
          })
        )
      }

      // Delete document from Firestore
      await deleteDoc(doc(db, 'cars', carId))
      setCars(prevCars => prevCars.filter(car => car.id !== carId))
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Error deleting listing')
    }
  }

  // Sort cars based on price
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
      <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center max-w-2xl mx-auto">
        <p className="text-red-600 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-800"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-8 max-w-2xl mx-auto">
        <p className="text-gray-600">No cars available at the moment.</p>
        <p className="text-sm text-gray-500 mt-2">
          {filter !== 'all' 
            ? `No cars found with status "${filter}". Try a different filter.`
            : 'Please check back later for new listings.'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sort buttons */}
      <div className="mb-6 flex gap-4 justify-end">
        <button
          onClick={() => setSortOrder(current => current === 'high' ? 'none' : 'high')}
          className={`px-4 py-2 rounded transition ${
            sortOrder === 'high'
              ? 'bg-black text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Highest Price
        </button>
        <button
          onClick={() => setSortOrder(current => current === 'low' ? 'none' : 'low')}
          className={`px-4 py-2 rounded transition ${
            sortOrder === 'low'
              ? 'bg-black text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Lowest Price
        </button>
      </div>

      {/* Car listings */}
      <div className="flex flex-col space-y-4">
        {sortedCars.map(car => (
          <CarCard 
            key={car.id} 
            car={car} 
            onDelete={() => handleDelete(car.id)} 
            isAdminPage={isAdminPage}
          />
        ))}
      </div>
    </div>
  )
}