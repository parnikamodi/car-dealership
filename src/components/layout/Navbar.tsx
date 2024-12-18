'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { PlusCircleIcon, UserCircleIcon, HomeIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user } = useAuth()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  const ADMIN_PASSWORD = "admin123"

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false)
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowPasswordModal(false)
        setPassword('')
        setError('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    // Prevent body scroll when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowPasswordModal(true)
    setIsMobileMenuOpen(false)
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
      setIsSettingsOpen(false)
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      <div className="min-h-[64px]"> {/* Spacer for fixed navbar */}
        <nav className="bg-white shadow-md fixed w-full top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center space-x-2">
                  <HomeIcon className="h-6 w-6 text-gray-800" />
                  <span className="hidden sm:block font-semibold text-gray-800">CarMarket</span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <>
                    <Link 
                      href="/create"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      <PlusCircleIcon className="h-5 w-5" />
                      <span>Create Ad</span>
                    </Link>
                    
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        <UserCircleIcon className="h-6 w-6" />
                        <span 
                          className="max-w-[150px] truncate text-ellipsis overflow-hidden"
                          title={user.email}
                        >
                          {user.email}
                        </span>
                      </button>

                      {isSettingsOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
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
                  <button 
                    onClick={handleLoginClick}
                    className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100"
                  >
                    Login
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  {isMobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 top-16 bg-white z-40 md:hidden">
              <div className="px-4 py-2 space-y-1">
                {user ? (
                  <>
                    <div 
                      className="px-3 py-2 text-sm font-medium text-gray-600 max-w-full truncate"
                      title={user.email}
                    >
                      {user.email}
                    </div>
                    <Link
                      href="/create"
                      className="block px-3 py-2 rounded-md text-base text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create Ad
                    </Link>
                    <Link
                      href="/account"
                      className="block px-3 py-2 rounded-md text-base text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="block w-full text-left px-3 py-2 rounded-md text-base text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-sm mx-auto">
            <h2 className="text-xl font-semibold mb-4">Enter Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPassword('')
                    setError('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
