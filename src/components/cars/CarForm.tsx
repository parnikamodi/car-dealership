'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase/config'
import { collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

interface FormData {
  name: string;
  year: number;
  info: string;
  price: number;
  location: string;
  featured: boolean;
}

const initialFormData: FormData = {
  name: '',
  year: new Date().getFullYear(),
  info: '',
  price: 0,
  location: '',
  featured: false
}

export default function CarForm() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isSubmitting) return

    try {
      setIsSubmitting(true)
      setError('')

      // Add document to Firestore
      await addDoc(collection(db, 'cars'), {
        ...formData,
        tel: '911234567890', // Fixed phone number
        uid: user.uid,
        email: user.email,
        imagePaths: [], // Initialize with empty array
        status: 'active',
        views: 0,
        createdAt: new Date().toISOString(),
      })

      router.push('/admin')
    } catch (error) {
      console.error('Error adding car:', error)
      setError('Failed to add listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name*</label>
          <input
            type="text"
            required
            placeholder="Enter car name"
            className="w-full p-2 border rounded"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Year*</label>
          <input
            type="number"
            required
            min={1900}
            max={new Date().getFullYear() + 1}
            className="w-full p-2 border rounded"
            value={formData.year || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description*</label>
          <textarea
            required
            rows={4}
            placeholder="Enter car details"
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
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Featured Listing</label>
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-amber-600"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : 'Add Listing'}
      </button>
    </form>
  )
}