'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { storage } from '@/lib/firebase/config'
import { ref, getDownloadURL } from 'firebase/storage'
import type { Car } from '@/lib/types/car'
import { EyeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface CarCardProps {
  car: Car;
  onDelete?: () => void;
}

export default function CarCard({ car, onDelete }: CarCardProps) {
  const { user } = useAuth()
  const { isAdmin } = useAdmin()
  const [imgUrl, setImgUrl] = useState("")

  useEffect(() => {
    const loadImage = async () => {
      if (car.imagePath) {  // Use imagePath instead of photo
        try {
          const url = await getDownloadURL(ref(storage, car.imagePath))
          setImgUrl(url)
        } catch (err) {
          console.error('Error loading image:', err)
        }
      }
    }
    loadImage()
  }, [car.imagePath])

  // Format price to Indian currency format
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex justify-between">
        <div className="flex-1">
          {/* Status and Featured badges */}
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              {car.status || 'Live'}
            </div>
            {car.featured && (
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                FEATURED
              </div>
            )}
          </div>
          
          {/* Car details */}
          <h2 className="font-medium text-lg mb-1">{car.name}</h2>
          <div className="text-gray-600 text-sm mb-2">
            {car.year} | {car.info}
          </div>
          
          {/* Additional info */}
          <div className="space-y-1 text-sm">
            <div>Ad Id: {car.id}</div>
            <div>Posted: {car.posted}</div>
            <div>Price: {formatPrice(car.price)}</div>
            <div>Location: {car.tel}</div>
          </div>
        </div>

        {/* Image and view count */}
        <div className="ml-4 relative">
          <img 
            src={imgUrl || '/placeholder.png'} 
            alt={car.name}
            className="w-32 h-24 object-cover rounded"
          />
          <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <EyeIcon className="w-3 h-3" />
            <span>{car.views || 0}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Link 
          href={`/ad/${car.id}`}
          className="text-blue-600 font-medium text-sm hover:text-blue-800"
        >
          VIEW DETAILS
        </Link>
        {isAdmin && (
          <button
            onClick={onDelete}
            className="text-red-600 font-medium text-sm hover:text-red-800 ml-auto"
          >
            DELETE
          </button>
        )}
      </div>
    </div>
  )
}