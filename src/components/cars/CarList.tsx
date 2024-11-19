'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import CarCard from './CarCard'
import type { Car } from '@/lib/types/car'

export default function CarList() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'none' | 'high' | 'low'>('none')
  const { user } = useAuth()

  // Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const carsRef = collection(db, "cars")
        const q = query(carsRef, orderBy("createdAt", "desc")) // Latest first
        const querySnapshot = await getDocs(q)
        const carsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Car[]
        
        console.log('Fetched cars:', carsData) // Debug log
        setCars(carsData)
      } catch (error) {
        console.error("Error fetching cars:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  // Handle car deletion
  const handleDelete = async (carId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return

    try {
      await deleteDoc(doc(db, "cars", carId))
      setCars(prevCars => prevCars.filter(car => car.id !== carId))
    } catch (error) {
      console.error("Error deleting car:", error)
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
      <div className="flex justify-center items-center py-8">
        <svg className="animate-spin h-8 w-8 text-gray-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No cars listed yet.</p>
        {user && (
          <p className="text-sm text-gray-500 mt-2">
            Be the first to create a listing!
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Filter buttons */}
      <div className="mb-6 flex gap-4">
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

      {/* Car listings */}
      <div className="space-y-4">
        {sortedCars.map((car) => (
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