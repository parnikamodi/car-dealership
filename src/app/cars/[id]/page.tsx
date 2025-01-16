'use client'

import { useEffect, useState, useCallback } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase/config'
import Image from 'next/image'
import { Car } from '@/lib/types/car'
import { PhoneIcon, CalendarIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ref, getDownloadURL } from 'firebase/storage'
import { useSwipeable } from 'react-swipeable'

export default function CarDetailPage() {
  const params = useParams()
  const [car, setCar] = useState<Car | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchCar = useCallback(async () => {
    if (!params.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      const carDoc = await getDoc(doc(db, 'cars', params.id as string))
      if (carDoc.exists()) {
        const carData = { id: carDoc.id, ...carDoc.data() } as Car
        setCar(carData)

        if (carData.imagePaths && carData.imagePaths.length > 0) {
          const urls = await Promise.all(
            carData.imagePaths.map(path => getDownloadURL(ref(storage, path)))
          )
          setImageUrls(urls)
        } else if (carData.imagePath) {
          const url = await getDownloadURL(ref(storage, carData.imagePath))
          setImageUrls([url])
        }
      } else {
        setError('Car not found')
      }
    } catch (err) {
      console.error('Error fetching car:', err)
      setError('Failed to load car details. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (mounted) {
      fetchCar()
    }
  }, [fetchCar, mounted])

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === imageUrls.length - 1 ? 0 : prev + 1
    )
  }, [imageUrls.length])

  const previousImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? imageUrls.length - 1 : prev - 1
    )
  }, [imageUrls.length])

  const formatLocation = useCallback((location: string | undefined) => {
    if (!location) return 'Location not specified'
    
    return location
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [])

  if (!mounted) return null

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-[500px] bg-gray-200 rounded-lg mb-6" />
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCar}
            className="text-amber-600 hover:text-amber-700 transition-colors"
            type="button"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!car) return null

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="relative aspect-[4/3] w-full mb-6 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
        {imageUrls.length > 0 ? (
          <>
            <Image
              src={imageUrls[currentImageIndex]}
              alt={`${car.name} - Image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={currentImageIndex === 0}
              quality={100}
            />
            
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition hidden md:block"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition hidden md:block"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {imageUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No images available
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">{car.name}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-5 w-5" />
            <span>{car.year}</span>
          </div>
          {car.location && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-5 w-5" />
              <span>{formatLocation(car.location)}</span>
            </div>
          )}
        </div>

        <div className="text-3xl font-bold text-amber-600">
          ₹{car.price.toLocaleString('en-IN')}
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-600 whitespace-pre-wrap">{car.info}</p>
        </div>

        <div className="pt-4 border-t">
          <h2 className="text-lg font-semibold mb-3">Contact Details</h2>
          <div className="space-y-2">
            <a
              href={`tel:${car.tel}`}
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700"
            >
              <PhoneIcon className="h-5 w-5" />
              <span>{car.tel}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
        >
          ← Back to Listings
        </Link>
      </div>
    </div>
  )
}