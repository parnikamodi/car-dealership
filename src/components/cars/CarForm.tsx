'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { storage, db } from '@/lib/firebase/config'
import { ref, uploadBytes } from 'firebase/storage'
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
  const { user, loading: authLoading } = useAuth() // Add loading state
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUpload, setImageUpload] = useState<File | null>(null)
  const [formData, setFormData] = useState<CarFormData>({
    name: '',
    year: new Date().getFullYear(),
    info: '',
    price: 0,
    tel: '',
    featured: false
  })

  // Wait for auth to be checked before redirecting
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Show loading state while checking auth
  if (authLoading) {
    return <div className="max-w-2xl mx-auto p-4">Loading...</div>
  }

  // Only redirect if we're sure there's no user
  if (!authLoading && !user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUpload || loading || !user) return

    try {
      setLoading(true)
      
      // Upload image
      const imageRef = ref(storage, `images/${imageUpload.name}${user.uid}`)
      await uploadBytes(imageRef, imageUpload)

      // Add car data
      await addDoc(collection(db, "cars"), {
        ...formData,
        uid: user.uid,
        email: user.email,
        photo: imageUpload.name + user.uid,
        posted: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        views: 0,
        status: 'Live'
      })

      router.push('/')
    } catch (error) {
      console.error('Error creating car listing:', error)
      alert('Error creating listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rest of your form fields remain the same */}
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

        <div>
          <label className="block text-sm font-medium mb-1">Featured Listing</label>
          <input
            type="checkbox"
            className="mr-2"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          />
          <span className="text-sm text-gray-600">Mark as featured listing</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 
                   transition disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  )
}