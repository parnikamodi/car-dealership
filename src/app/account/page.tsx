'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { UserCircleIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline'
import type { Car } from '@/lib/types/car'

export default function AccountPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userListings, setUserListings] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!user) return
      try {
        const q = query(
          collection(db, "cars"),
          where("uid", "==", user.uid)
        )
        const querySnapshot = await getDocs(q)
        const listings = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Car[]
        setUserListings(listings)
      } catch (error) {
        console.error('Error fetching user listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserListings()
  }, [user])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">Account Settings</h1>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b">
              <UserCircleIcon className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="text-gray-800 font-medium">{user.email?.split('@')[0]}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b">
              <EnvelopeIcon className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-800 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b">
              <KeyIcon className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Account ID</p>
                <p className="text-gray-800 font-mono text-sm">{user.uid}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Listings Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Listings</h2>
          
          {userListings.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              You haven&apos;t created any listings yet.
            </p>
          ) : (
            <div className="space-y-4">
              {userListings.map(listing => (
                <div 
                  key={listing.id} 
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{listing.name}</h3>
                    <p className="text-sm text-gray-600">₹{listing.price.toLocaleString()}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Added: {listing.year}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}