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

type SortOption = 'none' | 'priceHigh' | 'priceLow' | 'newest' | 'oldest';

export default function CarList({ isAdminPage = false, filter = 'all' }: CarListProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<SortOption>('newest')
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
  }, [filter])

  // Handle car deletion
  const handleDelete = async (carId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return

    try {
      // Fetch car data to delete associated images
      const carDoc = await getDoc(doc(db, 'cars', carId))
      
      if (carDoc.exists()) {
        const carData = carDoc.data()
        
        // Check if imagePaths exists and is an array with items
        if (carData?.imagePaths && Array.isArray(carData.imagePaths) && carData.imagePaths.length > 0) {
          // Delete images from storage
          for (const path of carData.imagePaths) {
            if (path) { // Additional check to ensure path exists
              try {
                const imageRef = ref(storage, path)
                await deleteObject(imageRef)
              } catch (imageError) {
                console.error(`Failed to delete image at path ${path}:`, imageError)
                // Continue with other deletions even if one fails
              }
            }
          }
        }

        // Check for single imagePath as fallback
        if (carData?.imagePath) {
          try {
            const imageRef = ref(storage, carData.imagePath)
            await deleteObject(imageRef)
          } catch (imageError) {
            console.error(`Failed to delete single image:`, imageError)
          }
        }
      }

      // Delete document from Firestore
      await deleteDoc(doc(db, 'cars', carId))
      setCars(prevCars => prevCars.filter(car => car.id !== carId))
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Failed to delete listing. Please try again.')
    }
  }

  // Sort cars based on selected option
  const sortedCars = [...cars].sort((a, b) => {
    switch (sortOrder) {
      case 'priceHigh':
        return b.price - a.price
      case 'priceLow':
        return a.price - b.price
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      default:
        return 0
    }
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
      {/* Sort controls */}
      <div className="mb-6">
        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
          Sort By:
        </label>
        <select
          id="sort"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOption)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="oldest">Oldest Listings</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="priceLow">Price: Low to High</option>
        </select>
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