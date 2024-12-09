'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { storage } from '@/lib/firebase/config'
import { ref, getDownloadURL } from 'firebase/storage'
import type { Car } from '@/lib/types/car'
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { useSwipeable } from 'react-swipeable'

interface CarCardProps {
  car: Car;
  onDelete?: () => void;
  isAdminPage?: boolean;
}

export default function CarCard({ car, onDelete, isAdminPage }: CarCardProps) {
  const { user } = useAuth()
  const [imgUrls, setImgUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const loadImages = async () => {
      if (car.imagePaths && car.imagePaths.length > 0) {
        try {
          const urls = await Promise.all(
            car.imagePaths.map(path => getDownloadURL(ref(storage, path)))
          )
          setImgUrls(urls)
        } catch (err) {
          console.error('Error loading images:', err)
        }
      }
    }
    loadImages()
  }, [car.imagePaths])

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setCurrentImageIndex(prev => (prev + 1) % imgUrls.length)
    },
    onSwipedRight: () => {
      setCurrentImageIndex(prev => (prev === 0 ? imgUrls.length - 1 : prev - 1))
    },
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
    delta: 10,
    swipeDuration: 500,
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div {...handlers} className="relative h-72">
        {imgUrls.length > 0 && (
          <Image
            src={imgUrls[currentImageIndex]}
            alt={car.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        )}
        
        {/* Views Counter */}
        <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
          <EyeIcon className="w-4 h-4" />
          <span>{car.views || 0}</span>
        </div>

        {/* Delete Button for Admin */}
        {user && isAdminPage && onDelete && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="absolute top-4 right-4 bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Car Details */}
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{car.name}</h3>
        <p className="text-amber-600 font-bold text-lg mb-2">
          {formatPrice(car.price)}
        </p>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{car.info}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Year: {car.year}</span>
          <Link 
            href={`/cars/${car.id}`}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}