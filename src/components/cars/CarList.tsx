'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import CarCard from './CarCard'
import Link from 'next/link'
import type { Car } from '@/lib/types/car'

export default function CarList() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'none' | 'high' | 'low'>('none')
  const { user } = useAuth()

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, "cars"), orderBy("price")))
        setCars(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Car[])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCars()
  }, [])

  if (loading) return <div className="text-center py-8">Loading...</div>

  const sortedCars = [...cars].sort((a, b) => 
    sortOrder === 'high' ? b.price - a.price : 
    sortOrder === 'low' ? a.price - b.price : 0
  )

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
        {user && (
          <Link href="/create" className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition">
            Create Ad
          </Link>
        )}
        
        <div className="flex gap-2">
          {['high', 'low'].map((order) => (
            <button 
              key={order}
              onClick={() => setSortOrder(order as 'high' | 'low')}
              className={`px-4 py-2 rounded transition ${
                sortOrder === order ? 'bg-black text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {order === 'high' ? 'Highest' : 'Lowest'} Price
            </button>
          ))}
        </div>
      </div>

      <div className="carCardContainer">
        {sortedCars.map(car => <CarCard key={car.id} car={car} onDelete={() => 
          setCars(cars.filter(c => c.id !== car.id))} />)}
      </div>
    </div>
  )
}