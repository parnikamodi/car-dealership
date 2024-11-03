'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { Cog6ToothIcon, PlusCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const { user } = useAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setIsSettingsOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex justify-between items-center px-6 sticky top-0 z-50 shadow-sm">
      <Link 
        href="/" 
        className="text-gray-800 hover:text-gray-600 font-medium transition"
      >
        Home
      </Link>
      
      <div className="flex gap-6 items-center relative">
        {user ? (
          <>
            <Link 
              href="/create"
              className="flex items-center gap-2 text-gray-800 hover:text-gray-600 font-medium transition"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span>Create Ad</span>
            </Link>
            <div ref={dropdownRef}>
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition"
              >
                <UserCircleIcon className="h-6 w-6" />
                <span className="font-medium">{user.email?.split('@')[0]}</span>
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <Link
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div ref={dropdownRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="text-gray-800 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </button>

            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}