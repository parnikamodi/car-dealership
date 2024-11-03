'use client'

const dummyData = [
  {
    id: "178643291",
    name: "Jeep Compass 2.0 Limited Option",
    year: 2022,
    info: "version-Compass 2.0 Limited",
    price: 1699000,
    tel: "Park Street, Kolkata",
    email: "test@test.com",
    uid: "1",
    photo: "jeep.jpg",
    views: 388,
    posted: "9 October 2024",
    featured: true
  },
  {
    id: "178635251",
    name: "Kia Seltos 1.4 GTX+ Turbo GDI Petrol",
    year: 2022,
    info: "kia-seltos-1.4-gtx+-turbo-gdi",
    price: 1350000,
    tel: "Lake View Road, Kolkata",
    email: "test@test.com",
    uid: "2",
    photo: "kia.jpg",
    views: 79,
    posted: "8 October 2024",
    featured: false
  },
  {
    id: "178635515",
    name: "Honda Amaze VX (O) i-VTEC",
    year: 2022,
    info: "cars-honda-amaze-vx-(o)-ivtec",
    price: 825000,
    tel: "Salt Lake, Kolkata",
    email: "test@test.com",
    uid: "3",
    photo: "honda.jpg",
    views: 123,
    posted: "8 October 2024",
    featured: false
  }
];

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
        Result: {dummyData.length} ad(s)
      </div>

      {/* Car listings - Updated styling */}
      <div className="divide-y">
        {dummyData.map((car) => (
          <div key={car.id} className="bg-white hover:bg-gray-50 transition-colors border-b border-gray-200 p-6">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">Live</div>
                  {car.featured && (
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white text-xs px-3 py-1 rounded-full font-medium">FEATURED</div>
                  )}
                </div>
                
                <h2 className="font-semibold text-lg mb-2 text-gray-800">{car.name}</h2>
                <div className="text-gray-600 text-sm mb-3">
                  {car.year} • {car.info}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Ad Id:</span> {car.id}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Posted:</span> {car.posted}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Price:</span> 
                    <span className="text-blue-600 font-semibold">₹ {formatPrice(car.price)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Location:</span> {car.tel}
                  </div>
                </div>
              </div>

              <div className="ml-6 relative">
                <img 
                  src="/placeholder.png"
                  alt={car.name}
                  className="w-36 h-28 object-cover rounded-lg shadow-sm"
                />
                <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span>{car.views}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-4">
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                GET VERIFIED
              </button>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                SELL FASTER
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}