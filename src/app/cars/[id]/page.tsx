'use client'

import { useState, useEffect, use } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase/config'
import { CalendarIcon, PhoneIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import type { Car } from '@/lib/types/car'
import { useRouter } from 'next/navigation'

// Image Modal Component
const ImageModal = ({ 
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  setCurrentIndex: (value: number | ((prev: number) => number)) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 transition-opacity duration-300">
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <XMarkIcon className="w-8 h-8" />
        </button>

        <button
          onClick={() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="relative w-full h-full max-w-6xl max-h-screen p-4">
          <div className="relative w-full h-full">
            <Image
              src={images[currentIndex]}
              alt={`Full view - Image ${currentIndex + 1}`}
              fill
              className="object-contain transform transition-transform duration-300 ease-out"
              sizes="100vw"
              priority
            />
          </div>
        </div>

        <button
          onClick={() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const CONTACT_PHONE_NUMBER = '+91 9822299888'

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carDoc = await getDoc(doc(db, 'cars', id))
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
  }, [id])

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          setCurrentImageIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));
          break;
        case 'ArrowRight':
          setCurrentImageIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
          break;
        case 'Escape':
          setIsModalOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, imageUrls.length]);

  if (loading) {
    return <div>Loading...</div>
  }

  if (error || !car) {
    return <div>{error || 'Car not found'}</div>
  }

  return (
    <>
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={imageUrls}
        currentIndex={currentImageIndex}
        setCurrentIndex={setCurrentImageIndex}
      />

      <div className="w-full bg-white shadow-sm py-3">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => router.push('/')}
            className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Back to Main Page
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="relative aspect-[16/10] md:aspect-[16/9] lg:aspect-[16/8] bg-gray-100 rounded-lg overflow-hidden mb-6">
          {imageUrls.length > 0 ? (
            <>
              <div 
                className="relative w-full h-full cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              >
                <Image
                  src={imageUrls[currentImageIndex]}
                  alt={`${car.name} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain hover:opacity-90 transition-opacity"
                  priority={currentImageIndex === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {imageUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
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
    </>
  )
}