'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'
import { CalendarIcon, PhoneIcon } from '@heroicons/react/24/outline'
import type { Car } from '@/lib/types/car'

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()

  const CONTACT_PHONE_NUMBER = process.env.NEXT_PUBLIC_CONTACT_PHONE_NUMBER || ''

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carDoc = await getDoc(doc(db, 'cars', params.id))
        if (!carDoc.exists()) {
          setError('Car not found')
          return
        }

        const carData = {
          id: carDoc.id,
          ...carDoc.data()
        } as Car

        setCar(carData)
        await loadImages(carData)
      } catch (err) {
        console.error('Error fetching car:', err)
        setError('Failed to load car details')
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [params.id])

  const loadImages = async (carData: Car) => {
    try {
      const urls: string[] = []

      if (carData.imagePaths?.length) {
        for (const path of carData.imagePaths) {
          const url = await getDownloadURL(ref(storage, path))
          urls.push(url)
        }
      } else if (carData.imagePath) {
        const url = await getDownloadURL(ref(storage, carData.imagePath))
        urls.push(url)
      }

      setImageUrls(urls)
    } catch (err) {
      console.error('Error loading images:', err)
      setError('Failed to load images')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !car) {
    return <div>{error || 'Car not found'}</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
        {imageUrls.length > 0 ? (
          <>
            <img
              src={imageUrls[currentImageIndex]}
              alt={`${car.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />

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
            <div className="flex items-center gap-2 text-amber-600">
              <PhoneIcon className="h-5 w-5" />
              <span>{CONTACT_PHONE_NUMBER}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}