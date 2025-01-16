'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, getDocs, orderBy, where, Query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import CarCard from './CarCard'
import { Car } from '@/lib/types/car'
import { deleteDoc, doc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'

type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low'

interface CarListProps {
  isAdminPage?: boolean
  filter?: 'all' | 'active' | 'sold' | 'pending'
}

export default function CarList({ isAdminPage = false, filter = 'all' }: CarListProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOption>('newest')

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
          imagePaths: data.imagePaths || [],
          featured: data.featured,
          status: data.status,
          views: data.views || 0,
          location: data.location || '',
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
    fetchCars()
  }, [fetchCars])

  const handleDelete = useCallback(async (car: Car) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'cars', car.id))

      if (car.imagePaths?.length) {
        await Promise.allSettled(
          car.imagePaths.map(path => 
            deleteObject(ref(storage, path))
              .catch(err => console.warn(`Failed to delete image ${path}:`, err))
          )
        )
      }

      setCars(prevCars => prevCars.filter(c => c.id !== car.id))
    } catch (error) {
      console.error('Error in deletion process:', error)
      setError('Failed to delete the listing. Please try again.')
    }
  }, [])

  const handleUpdate = useCallback(async (id: string, data: Partial<Car>) => {
    try {
      await updateDoc(doc(db, 'cars', id), data)
      setCars(prevCars =>
        prevCars.map(car =>
          car.id === id ? { ...car, ...data } : car
        )
      )
    } catch (error) {
      console.error('Error updating car:', error)
      throw error
    }
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {cars.map(car => (
        <CarCard
          key={car.id}
          car={car}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          isAdminPage={isAdminPage}
        />
      ))}
    </div>
  )
}