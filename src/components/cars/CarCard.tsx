'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { storage } from '@/lib/firebase/config'
import { ref, getDownloadURL } from 'firebase/storage'
import type { Car } from '@/lib/types/car'
import { EyeIcon } from '@heroicons/react/24/outline'

interface CarCardProps {
  car: Car;
  onDelete?: () => void;
}

export default function CarCard({ car, onDelete }: CarCardProps) {
  const { user } = useAuth()
  const [imgUrl, setImgUrl] = useState("")

  useEffect(() => {
    if (car.photo) {
      getDownloadURL(ref(storage, `images/${car.photo}`))
        .then(url => setImgUrl(url))
        .catch(err => console.error('Error loading image:', err))
    }
  }, [car.photo])

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex justify-between">
        <div className="flex-1">
          {/* Left side content */}
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Live</div>
            <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded">FEATURED</div>
          </div>
          
          <h2 className="font-medium text-lg mb-1">{car.name}</h2>
          <div className="text-gray-600 text-sm mb-2">
            {car.year} | {car.info}
          </div>
          
          <div className="space-y-1 text-sm">
            <div>Ad Id: {car.id}</div>
            <div>Posted: {new Date().toLocaleDateString()}</div>
            <div>Price: ₹ {car.price.toLocaleString()}</div>
            <div>Location: {car.tel}</div>
          </div>
        </div>

        {/* Right side image */}
        <div className="ml-4 relative">
          <img 
            src={imgUrl || '/placeholder.png'} 
            alt={car.name}
            className="w-32 h-24 object-cover rounded"
          />
          <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <EyeIcon className="w-3 h-3" />
            <span>388</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="text-blue-600 font-medium text-sm">
          GET VERIFIED
        </button>
        <button className="text-blue-600 font-medium text-sm">
          SELL FASTER
        </button>
      </div>
    </div>
  )
}