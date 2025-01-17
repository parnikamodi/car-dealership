'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, query, orderBy, deleteDoc, doc, where, Query, updateDoc, Timestamp } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase/config'
import CarCard from './CarCard'
import type { Car } from '@/lib/types/car'
import { useInView } from 'react-intersection-observer';

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  

  const fetchCars = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const carsRef = collection(db, 'cars')
      let q: Query = query(carsRef, orderBy('createdAt', 'desc'))

      if (filter !== 'all') {
        q = query(carsRef, 
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        )
      }

      const querySnapshot = await getDocs(q)
      const carsData = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          uid: data.uid,
          name: data.name,
          price: data.price,
          year: data.year,
          info: data.info,
          tel: data.tel,
          email: data.email,
          imagePath: data.imagePath,
          imagePaths: data.imagePaths,
          featured: data.featured,
          status: data.status,
          views: data.views,
          posted: data.posted,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        } as Car
      })

      setCars(carsData)
    } catch (error) {
      console.error('Error fetching cars:', error)
      setError('Failed to load cars. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (mounted) {
      fetchCars()
    }
  }, [fetchCars, mounted])

  const handleDelete = useCallback(async (car: Car) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return
    }

    try {
      // Delete the document first
      await deleteDoc(doc(db, 'cars', car.id))
      console.log('Document deleted successfully')

      // Then try to delete images
      const deleteImagePromises: Promise<void>[] = []

      if (car.imagePaths?.length) {
        car.imagePaths.forEach(path => {
          const imageRef = ref(storage, path)
          const deletePromise = deleteObject(imageRef)
            .then(() => console.log(`Successfully deleted image: ${path}`))
            .catch(err => {
              console.warn(`Failed to delete image ${path}:`, err)
              // Don't throw error here, just log it
            })
          deleteImagePromises.push(deletePromise)
        })
      }

      if (car.imagePath) {
        const imageRef = ref(storage, car.imagePath)
        const deletePromise = deleteObject(imageRef)
          .then(() => console.log(`Successfully deleted single image: ${car.imagePath}`))
          .catch(err => {
            console.warn(`Failed to delete single image ${car.imagePath}:`, err)
            // Don't throw error here, just log it
          })
        deleteImagePromises.push(deletePromise)
      }

      // Wait for all image deletions to complete
      await Promise.allSettled(deleteImagePromises)
      
      // Update UI state regardless of image deletion success
      setCars(prevCars => prevCars.filter(c => c.id !== car.id))
      console.log('Deletion process completed')

    } catch (error) {
      console.error('Error in deletion process:', error)
      setError('Failed to delete the listing. Please try again.')
    }
  }, [])

  const handleUpdate = useCallback(async (id: string, updatedData: Partial<Car>): Promise<void> => {
    try {
      const carRef = doc(db, 'cars', id)
      
      const updateData = {
        ...updatedData,
        updatedAt: Timestamp.now()
      }

      await updateDoc(carRef, updateData)

      setCars(prevCars =>
        prevCars.map(car =>
          car.id === id
            ? { 
                ...car, 
                ...updatedData,
              }
            : car
        )
      )
    } catch (error) {
      console.error('Error updating car:', error)
      setError('Failed to update the listing. Please try again.')
      throw error
    }
  }, [])

  const sortedCars = useCallback(() => {
    return [...cars].sort((a, b) => {
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
  }, [cars, sortOrder])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 sm:px-6 md:max-w-2xl md:mx-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-48 sm:h-56 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-4 sm:mx-6 md:max-w-2xl md:mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={() => fetchCars()}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-8 px-4 sm:px-6 md:max-w-2xl md:mx-auto">
        <p className="text-gray-600">No cars available at the moment.</p>
        <p className="text-sm text-gray-500 mt-2">
          {filter !== 'all' 
            ? `No cars found with status "${filter}". Try a different filter.`
            : 'Please check back later for new listings.'}
        </p>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <div className="px-4 sm:px-6 md:max-w-2xl md:mx-auto">
      <div className="mb-6 sticky top-0 bg-gray-50 p-3 rounded-lg shadow-sm z-10">
        <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
          Sort By:
        </label>
        <select
          id="sort"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOption)}
          className="block w-full p-2.5 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="oldest">Oldest Listings</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="priceLow">Price: Low to High</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-6">
        {sortedCars().map(car => (
          <div key={car.id} className="transform transition-transform hover:-translate-y-1">
            <CarCard 
              car={car} 
              onDelete={() => handleDelete(car)}
              onUpdate={handleUpdate}
              isAdminPage={isAdminPage}
            />
          </div>
        ))}
      </div>
    </div>
  )
}