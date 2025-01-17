'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { storage } from '@/lib/firebase/config'
import { ref, getDownloadURL } from 'firebase/storage'
import type { Car } from '@/lib/types/car'
import { TrashIcon, PencilIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface CarCardProps {
  car: Car;
  onDelete?: () => Promise<void>;
  onUpdate?: (id: string, updatedData: Partial<Car>) => Promise<void>;
  isAdminPage?: boolean;
}

export default function CarCard({ car, onDelete, onUpdate, isAdminPage }: CarCardProps) {
  const { user } = useAuth()
  const [imgUrls, setImgUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editForm, setEditForm] = useState({
    name: car.name,
    year: car.year,
    price: car.price,
    info: car.info || '',
    featured: car.featured || false
  })

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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrentImageIndex((prevIndex) => {
      if (newDirection === 1) {
        return prevIndex === imgUrls.length - 1 ? 0 : prevIndex + 1
      }
      return prevIndex === 0 ? imgUrls.length - 1 : prevIndex - 1
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (!onUpdate) {
        throw new Error('onUpdate function is not defined')
      }
      await onUpdate(car.id, {
        name: editForm.name,
        year: Number(editForm.year),
        price: Number(editForm.price),
        info: editForm.info,
        featured: editForm.featured
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating car:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const CardContent = () => (
    <>
      <div className="relative h-72 bg-gray-100 group overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentImageIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
            className="absolute w-full h-full"
          >
            {imgUrls.length > 0 ? (
              <Image
                src={imgUrls[currentImageIndex]}
                alt={car.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={currentImageIndex === 0}
                loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {imgUrls.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                paginate(-1)
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault()
                paginate(1)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {imgUrls.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault()
                    setDirection(index > currentImageIndex ? 1 : -1)
                    setCurrentImageIndex(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-opacity duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/60'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          </>
        )}

        {user && isAdminPage && (
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-amber-500/80 backdrop-blur-sm text-white p-2 rounded-full active:bg-amber-600"
              aria-label={isEditing ? "Cancel editing" : "Edit car listing"}
              type="button"
            >
              {isEditing ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <PencilIcon className="h-5 w-5" />
              )}
            </button>
            
            {onDelete && (
              <button 
                onClick={async (e) => {
                  e.preventDefault()
                  if (window.confirm('Are you sure you want to delete this listing?')) {
                    try {
                      await onDelete()
                    } catch (error) {
                      console.error('Error deleting car:', error)
                    }
                  }
                }}
                className="bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full active:bg-red-600"
                aria-label="Delete car listing"
                type="button"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Edit Listing</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={editForm.year}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{car.name}</h3>
                <p className="text-amber-600 font-bold text-lg">
                  {formatPrice(car.price)}
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{car.info}</p>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Year: {car.year}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isAdminPage ? (
        <CardContent />
      ) : (
        <Link 
          href={`/cars/${car.id}`}
          className="block cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <CardContent />
        </Link>
      )}
    </motion.div>
  )
}