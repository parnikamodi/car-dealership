'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { storage, db } from '@/lib/firebase/config'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface CarFormData {
  name: string;
  year: number;
  info: string;
  price: number;
  tel: string;
  featured: boolean;
}

export default function CarForm() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUpload, setImageUpload] = useState<File[]>([])
  const [formData, setFormData] = useState<CarFormData>({
    name: '',
    year: new Date().getFullYear(),
    info: '',
    price: 0,
    tel: '',
    featured: false
    
  })
  /*
  useEffect(() => {
    if (user) {
      console.log("Your Admin Details:", {
        uid: user.uid,
        email: user.email
      });
    }
  }, [user]);*/

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return <div className="max-w-2xl mx-auto p-4">Loading...</div>
  }

  if (!authLoading && !user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Starting form submission...")

    if (!imageUpload || loading || !user) {
      console.log("Validation failed:", { imageUpload: !!imageUpload, loading, user: !!user })
      alert('Please ensure all fields are filled and you are logged in')
      return
    }

    try {
      setLoading(true)
      console.log("Selected file:", imageUpload.name, "Type:", imageUpload.type)

      // 1. Create a safe filename
      const timestamp = Date.now()
      const fileExtension = imageUpload.name.split('.').pop()
      const safeFileName = `${timestamp}.${fileExtension}`
      const filePath = `images/${user.uid}/${safeFileName}`

      console.log("Generated file path:", filePath)

      // 2. Create storage reference
      const storageRef = ref(storage, filePath)
      console.log("Storage reference created")

      // 3. Upload with metadata
      console.log("Starting upload...")
      const metadata = {
        contentType: imageUpload.type
      }
      const uploadResult = await uploadBytes(storageRef, imageUpload, metadata)
      console.log("Upload completed:", uploadResult)

      // 4. Get download URL
      console.log("Getting download URL...")
      const downloadURL = await getDownloadURL(uploadResult.ref)
      console.log("Got download URL:", downloadURL)

      // 5. Create Firestore document
      const carData = {
        name: formData.name,
        year: Number(formData.year),
        info: formData.info,
        price: Number(formData.price),
        tel: formData.tel,
        featured: formData.featured,
        uid: user.uid,
        email: user.email,
        imageUrl: downloadURL,
        imagePath: filePath,
        posted: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        views: 0,
        status: 'Live',
        createdAt: new Date().toISOString()
      }

      console.log("Saving to Firestore:", carData)
      const docRef = await addDoc(collection(db, "cars"), carData)
      console.log("Document created with ID:", docRef.id)

      alert('Advertisement created successfully!')
      router.push('/')

    } catch (error) {
      console.error("Full error object:", error)
      if (error instanceof Error) {
        console.error("Error name:", error.name)
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
      setLoading(false)
      alert(`Error creating listing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Car Model & Variant*</label>
          <input
            type="text"
            required
            placeholder="e.g., Jeep Compass 2.0 Limited Option"
            className="w-full p-2 border rounded"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Model Year*</label>
          <input
            type="number"
            required
            min={1900}
            max={new Date().getFullYear() + 1}
            className="w-full p-2 border rounded"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Version Info*</label>
          <input
            type="text"
            required
            placeholder="e.g., version-Compass 2.0 Limited"
            className="w-full p-2 border rounded"
            value={formData.info}
            onChange={(e) => setFormData(prev => ({ ...prev, info: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price (₹)*</label>
          <input
            type="number"
            required
            min={0}
            placeholder="Enter price in rupees"
            className="w-full p-2 border rounded"
            value={formData.price || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location*</label>
          <input
            type="text"
            required
            placeholder="e.g., Park Street, Kolkata"
            className="w-full p-2 border rounded"
            value={formData.tel}
            onChange={(e) => setFormData(prev => ({ ...prev, tel: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Car Image*</label>
          <input
            type="file"
            required
            accept="image/*"
            onChange={(e) => setImageUpload(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded file:mr-4 file:py-2 file:px-4 
                     file:rounded file:border-0 file:bg-blue-500 file:text-white
                     hover:file:bg-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Featured Listing</label>
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-500"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 
                   transition disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </>
          ) : (
            'Create Listing'
          )}
        </button>
      </form>
    </div>
  )
}