'use client'

// Utility function for consistent price formatting
const formatPrice = (price: number) => {
  // Convert to Indian format (e.g., 16,99,000)
  return price.toString().replace(/\B(?=(?:(\d\d)+(\d)(?!\d))+(?!\d))/g, ',');
}

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto bg-gray-50 min-h-screen">
      {/* Filter tabs - Updated styling */}
      <div className="flex gap-3 p-5 border-b bg-white sticky top-16 shadow-sm">
        <button className="px-5 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">All</button>
        <button className="px-5 py-1.5 rounded-full border hover:bg-gray-50 hover:border-blue-300 transition-all">Live</button>
        <button className="px-5 py-1.5 rounded-full border hover:bg-gray-50 hover:border-blue-300 transition-all">Processing</button>
        <button className="px-5 py-1.5 rounded-full border hover:bg-gray-50 hover:border-blue-300 transition-all">Expired</button>
        <button className="px-5 py-1.5 rounded-full border hover:bg-gray-50 hover:border-blue-300 transition-all">Limited</button>
        <button className="px-5 py-1.5 rounded-full border hover:bg-gray-50 hover:border-blue-300 transition-all">Archive</button>
      </div>

      {/* Results count - Updated styling */}
      <div className="p-5 text-sm text-gray-600 font-medium">
        Result: 0 ad(s)
      </div>

      {/* Car listings - Updated styling */}
      <div className="divide-y">
        {/* Remove map function and its contents */}
      </div>
    </div>
  )
}