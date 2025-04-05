'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { PlusCircleIcon, UserCircleIcon, CogIcon, HomeIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar(): JSX.Element {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const pathname = usePathname()
  const isAdminPage = pathname === '/admin'

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth)
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Early return for server-side rendering
  if (!mounted) {
    return (
      <nav className="bg-white shadow-md" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="flex items-center gap-2 text-gray-800 font-semibold">
                <HomeIcon className="h-6 w-6" />
                <span className="text-lg">Plus Marketing</span>
              </span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-md" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Brand/Home */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-800 hover:text-amber-600 font-semibold transition-colors duration-200"
              aria-label="Home"
            >
              <HomeIcon className="h-6 w-6" />
              <span className="text-lg">Plus Marketing</span>
            </Link>
          </div>

          {/* Center - Action Buttons */}
          {user && (
            <div className="flex items-center gap-4">
              <Link 
                href="/create"
                className="flex items-center gap-1 text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
                aria-label="Create Advertisement"
              >
                <PlusCircleIcon className="h-5 w-5" />
                <span className="text-sm">Create</span>
              </Link>
              
              {!isAdminPage && (
                <Link 
                  href="/admin"
                  className="flex items-center gap-1 text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
                  aria-label="Delete Advertisement"
                >
                  <CogIcon className="h-5 w-5" />
                  <span className="text-sm">Manage Ad</span>
                </Link>
              )}
            </div>
          )}

          {/* Right side - User Menu */}
          {user && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-amber-600 transition-colors duration-200"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && (
        <div 
          className={`${isMobileMenuOpen ? 'block' : 'hidden'}`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-4 pt-2 pb-3 space-y-2 border-t">
            <div className="flex items-center gap-2 px-3 py-2 text-gray-700">
              <UserCircleIcon className="h-6 w-6" />
              <span className="font-medium">{user.email?.split('@')[0]}</span>
            </div>
            <Link
              href="/account"
              className="block text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200 px-3 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
              role="menuitem"
            >
              Account Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left text-red-600 hover:text-red-700 font-medium transition-colors duration-200 px-3 py-2"
              role="menuitem"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
