'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAdmin } from '@/hooks/useAdmin'
import { storage } from '@/lib/firebase/config'
import { ref, getDownloadURL } from 'firebase/storage'
import type { Car } from '@/lib/types/car'
import { EyeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

interface CarCardProps {
 car: Car;
 onDelete?: () => void;
 isAdminPage?: boolean;
}

export default function CarCard({ car, onDelete, isAdminPage }: CarCardProps) {
 const isAdmin = useAdmin()
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
       className="relative h-72"
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
     >
       {imgUrls.length > 0 ? (
         <div className="relative w-full h-72">
           <Image
             src={imgUrls[currentImageIndex]}
             alt={car.name}
             fill
             className="object-cover rounded-t-lg"
             sizes="(max-width: 768px) 100vw, 50vw"
             priority
           />
         </div>
       ) : (
         <div className="w-full h-72 bg-gray-200 rounded-t-lg" />
       )}

       {/* Navigation Arrows */}
       {isHovered && imgUrls.length > 1 && (
         <>
           <button
             onClick={previousImage}
             className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 z-10"
           >
             <ChevronLeftIcon className="h-8 w-8 text-white" />
           </button>
           <button
             onClick={nextImage}
             className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 z-10"
           >
             <ChevronRightIcon className="h-8 w-8 text-white" />
           </button>
         </>
       )}

       {/* Image Counter */}
       {imgUrls.length > 1 && (
         <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded z-10">
           {currentImageIndex + 1} / {imgUrls.length}
         </div>
       )}

       {/* Views Counter */}
       <div className="absolute top-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded flex items-center gap-2 z-10">
         <EyeIcon className="w-4 h-4" />
         <span>{car.views || 0}</span>
       </div>
     </div>

     {/* Car Details */}
     <div className="p-6">
       <div className="flex items-center gap-3 mb-3">
         <div className="bg-blue-500 text-white text-sm px-3 py-1.5 rounded">
           {car.status || 'Live'}
         </div>
         {car.featured && (
           <div className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded">
             FEATURED
           </div>
         )}
       </div>

       <h2 className="font-medium text-xl mb-2">{car.name}</h2>
       <div className="text-gray-600 text-base mb-3">
         {car.year} | {car.info}
       </div>

       <div className="space-y-2 text-base text-gray-600">
         <div>Ad Id: {car.id}</div>
         <div>Posted: {car.posted}</div>
         <div>Price: {formatPrice(car.price)}</div>
         <div>Location: {car.tel}</div>
       </div>

       <div className="mt-6 flex gap-3">
         <Link 
           href={`/ad/${car.id}`}
           className="text-blue-600 font-medium text-base hover:text-blue-800"
         >
           VIEW DETAILS
         </Link>
         {isAdmin && isAdminPage && (
           <button 
             onClick={onDelete} 
             className="text-red-600 font-medium text-base hover:text-red-800 ml-auto"
           >
             DELETE
           </button>
         )}
       </div>
     </div>
   </div>
 )
}