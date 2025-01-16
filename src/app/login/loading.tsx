export default function LoginLoading() {
    return (
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
            
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            
            <div className="mt-4">
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }