'use client'
 
import { useEffect } from 'react'
import Link from 'next/link'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="space-x-4">
            <button
              onClick={reset}
              className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition"
            >
              Try again
            </button>
            <Link 
              href="/"
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition inline-block"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}