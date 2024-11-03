import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Not Found</h2>
        <p className="text-gray-600 mb-4">Could not find requested resource</p>
        <Link 
          href="/"
          className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition inline-block"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}