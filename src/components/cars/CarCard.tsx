'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { storage } from '@/lib/firebase/config'
import { ref, getDownloadURL } from 'firebase/storage'
import type { Car } from '@/lib/types/car'
import { EyeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface CarCardProps {
  car: Car
  onDelete?: () => void
}

export default function CarCard({ car, onDelete }: CarCardProps) {
  const { user } = useAuth()
  const { isAdmin } = useAdmin()
  const [imgUrls, setImgUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

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
      } else if (car.imagePath) {
        try {
          const url = await getDownloadURL(ref(storage, car.imagePath))
          setImgUrls([url])
        } catch (err) {
          console.error('Error loading image:', err)
        }
      }
    }
    loadImages()
  }, [car.imagePaths, car.imagePath])

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % imgUrls.length)
  }

  const previousImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? imgUrls.length - 1 : prev - 1))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Image Section */}
      <div
        className="relative h-48"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {imgUrls.length > 0 ? (
          <img
            src={imgUrls[currentImageIndex]}
            alt={car.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-t-lg" />
        )}

        {/* Navigation Arrows */}
        {isHovered && imgUrls.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full hover:bg-black/70"
            >
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full hover:bg-black/70"
            >
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {imgUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {imgUrls.length}
          </div>
        )}

        {/* Views Counter */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <EyeIcon className="w-3 h-3" />
          <span>{car.views || 0}</span>
        </div>
      </div>

      {/* Car Details */}
      <div className="p-4">
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

        <h2 className="font-medium text-lg mb-1">{car.name}</h2>
        <div className="text-gray-600 text-sm mb-2">
          {car.year} | {car.info}
        </div>

        <div className="space-y-1 text-sm text-gray-600">
          <div>Ad Id: {car.id}</div>
          <div>Posted: {car.posted}</div>
          <div>Price: {formatPrice(car.price)}</div>
          <div>Location: {car.tel}</div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/ad/${car.id}`}
            className="text-blue-600 font-medium text-sm hover:text-blue-800"
          >
            VIEW DETAILS
          </Link>
          {(user?.uid === car.uid || isAdmin) && (
            <button
              onClick={onDelete}
              className="text-red-600 font-medium text-sm hover:text-red-800 ml-auto"
            >
              DELETE
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
