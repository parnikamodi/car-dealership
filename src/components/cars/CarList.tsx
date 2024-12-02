'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import CarCard from './CarCard'
import type { Car } from '@/lib/types/car'

export default function CarList() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'none' | 'high' | 'low'>('none')
  const [error, setError] = useState<string | null>(null)
  // Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true); // Show loading indicator
      setError(null);   // Clear any previous errors
  
      try {
        const carsRef = collection(db, "cars");
        const q = query(carsRef, orderBy("createdAt", "desc")); // Fetch latest cars
        const querySnapshot = await getDocs(q);
  
        const carsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Car[];
  
        console.log('Fetched cars:', carsData); // Debug log
        setCars(carsData);
      } catch (error) {
        console.error("Error fetching cars:", error);
        setError('Failed to load cars. Please try again later.'); // Show error to users
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };
  
    fetchCars(); // Clearly call the function outside its definition
  }, []);
  

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
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
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
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
      <div className="text-center py-8">
        <p className="text-gray-600">No cars available at the moment.</p>
        <p className="text-sm text-gray-500 mt-2">
          Please check back later for new listings.
        </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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