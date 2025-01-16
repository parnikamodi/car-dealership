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

// Predefined contact numbers
const PREDEFINED_NUMBERS = [
  '+91 98765 43210',
  '+91 87654 32109',
  '+91 76543 21098'
]

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
      <div className="max-w-4xl mx-auto p-6">
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="relative h-[500px] mb-6 bg-gray-100 rounded-lg overflow-hidden group shadow-lg">
        {imageUrls.length > 0 ? (
          <>
            <Image
              src={imageUrls[currentImageIndex]}
              alt={`${car.name} - Image ${currentImageIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={currentImageIndex === 0}
              loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
            />
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                  type="button"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                  type="button"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                      type="button"
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No images available
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.name}</h1>
            <p className="text-2xl font-semibold text-amber-600">
              ₹{car.price.toLocaleString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${car.status === 'available' 
              ? 'bg-green-100 text-green-800'
              : car.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
            }`}>
            {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="h-5 w-5" />
              <span>Year: {car.year}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <MapPinIcon className="h-5 w-5" />
              <span>{formatLocation(car.location)}</span>
            </div>

            <div className="space-y-2">
              {PREDEFINED_NUMBERS.map((number, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-600">
                  <PhoneIcon className="h-5 w-5" />
                  <a 
                    href={`tel:${number.replace(/\s+/g, '')}`}
                    className="hover:text-amber-600 transition-colors"
                  >
                    {number}
                  </a>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="text-gray-600">
              <p className="text-sm text-gray-500">Posted on: {car.posted}</p>
              {car.email && (
                <p className="text-sm text-gray-500 mt-1">Email: {car.email}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{car.info}</p>
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