'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { PlusCircleIcon, UserCircleIcon, CogIcon, HomeIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const modalRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const isAdminPage = pathname === '/admin'

  const ADMIN_PASSWORD = "admin123"

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowPasswordModal(false)
        setPassword('')
        setError('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowPasswordModal(true)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setShowPasswordModal(false)
      setPassword('')
      setError('')
      router.push('/login')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const NavActions = () => (
    <>
      <Link 
        href="/create"
        className="flex items-center gap-1 text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
      >
        <PlusCircleIcon className="h-5 w-5" />
        <span className="text-sm">Create</span>
      </Link>
      
      {!isAdminPage && (
        <Link 
          href="/admin"
          className="flex items-center gap-1 text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200"
        >
          <CogIcon className="h-5 w-5" />
          <span className="text-sm">Delete</span>
        </Link>
      )}
    </>
  )

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Brand/Home */}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-gray-800 hover:text-amber-600 font-semibold transition-colors duration-200"
              >
                <HomeIcon className="h-6 w-6" />
                <span className="text-lg">CarMarket</span>
              </Link>
            </div>

            {/* Center - Action Buttons (visible on all screens) */}
            {user && (
              <div className="flex items-center gap-4">
                <NavActions />
              </div>
            )}

            {/* Right side - User Menu/Login */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-700 hover:text-amber-600 transition-colors duration-200"
                  >
                    {isMobileMenuOpen ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" />
                    )}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLoginClick}
                  className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200 
                           px-4 py-2 rounded-md border border-gray-300 hover:border-amber-600"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu - Only for user settings */}
        {user && (
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-4 pt-2 pb-3 space-y-2 border-t">
              <div className="flex items-center gap-2 px-3 py-2 text-gray-700">
                <UserCircleIcon className="h-6 w-6" />
                <span className="font-medium">{user.email?.split('@')[0]}</span>
              </div>
              <Link
                href="/account"
                className="block text-gray-700 hover:text-amber-600 font-medium transition-colors duration-200 px-3 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-600 hover:text-red-700 font-medium transition-colors duration-200 px-3 py-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-96 mx-4">
            <h2 className="text-xl font-semibold mb-4">Enter Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter password"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPassword('')
                    setError('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors duration-200"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}