'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { storage, db } from '@/lib/firebase/config'
import { ref, uploadBytes } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/utils/imageCompression'
import Image from 'next/image'

interface ImageUploadState {
  file: File;
  preview?: string;
  uploading: boolean;
  error?: string;
}

interface FormData {
  name: string;
  year: number;
  info: string;
  price: number;
  featured: boolean;
}

export default function CarForm() {
  const TARGET_MIN_KB = 50;  // Minimum image size in KB
  const TARGET_MAX_KB = 200; // Maximum image size in KB
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageUploads, setImageUploads] = useState<ImageUploadState[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    year: new Date().getFullYear(),
    info: '',
    price: 0,
    featured: false
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    return () => {
      imageUploads.forEach(upload => {
        if (upload.preview) {
          URL.revokeObjectURL(upload.preview)
        }
      })
    }
  }, [imageUploads])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setLoading(true);
    const files = Array.from(e.target.files);
    const totalFiles = files.length;
    
    try {
      const BATCH_SIZE = 3;
      const processedFiles: { file: File; name: string; size: number; preview: string }[] = [];
      
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(totalFiles/BATCH_SIZE)}`);
        
        const batchResults = await Promise.all(
          batch.map(async (file, index) => {
            const currentIndex = i + index + 1;
            setUploadProgress((currentIndex / totalFiles) * 100);
            
            console.log(`Processing ${currentIndex}/${totalFiles}: ${file.name}`);
            const compressed = await compressImage(file);
            const sizeKB = compressed.size / 1024;
            
            // Log compression results
            console.log(`Compressed ${file.name}: ${sizeKB.toFixed(2)}KB`);
            
            return {
              file: compressed,
              name: file.name,
              size: compressed.size,
              preview: URL.createObjectURL(compressed)
            };
          })
        );
        
        processedFiles.push(...batchResults);
      }
  
      // Check for files outside range but don't throw error
      const outOfRangeFiles = processedFiles.filter(({ file }) => {
        const sizeKB = file.size / 1024;
        return sizeKB < TARGET_MIN_KB || sizeKB > TARGET_MAX_KB;
      });
  
      if (outOfRangeFiles.length > 0) {
        const warningMessage = outOfRangeFiles.map(({ name, size }) => 
          `${name}: ${(size/1024).toFixed(2)}KB`
        ).join('\n');
        
        const proceed = window.confirm(
          `Some images couldn't be compressed to the target range (50-100KB):\n\n${warningMessage}\n\nDo you want to proceed anyway?`
        );
  
        if (!proceed) {
          setLoading(false);
          setUploadProgress(0);
          return;
        }
      }
  
      setImageUploads(prev => [...prev, ...processedFiles]);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (imageUploads.length === 0 || loading || !user) {
      alert('Please add at least one image and ensure you are logged in')
      return
    }

    try {
      setLoading(true)
      setUploadProgress(0)
      const totalUploads = imageUploads.length
      let completedUploads = 0

      const imagePaths = await Promise.all(
        imageUploads.map(async (upload, index) => {
          const timestamp = Date.now()
          const randomId = Math.random().toString(36).substring(7)
          const fileExtension = upload.file.name.split('.').pop()
          const safeFileName = `${timestamp}_${randomId}_${index}.${fileExtension}`
          const filePath = `images/${user.uid}/${safeFileName}`
          
          const storageRef = ref(storage, filePath)
          await uploadBytes(storageRef, upload.file)
          
          completedUploads++
          setUploadProgress((completedUploads / totalUploads) * 100)
          
          return filePath
        })
      )

      const carData = {
        name: formData.name,
        year: Number(formData.year),
        info: formData.info,
        price: Number(formData.price),
        featured: formData.featured,
        uid: user.uid,
        email: user.email,
        imagePaths: imagePaths,
        posted: new Date().toLocaleDateString('en-GB'),
        views: 0,
        status: 'Live',
        createdAt: new Date().toISOString()
      }

      await addDoc(collection(db, "cars"), carData)
      alert('Advertisement created successfully!')
      router.push('/')

    } catch (error) {
      console.error("Error:", error)
      alert(`Error creating listing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Car Images (Up to 50)*</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full p-2 border rounded"
          />
          {uploadProgress > 0 && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded">
                <div 
                  className="h-2 bg-blue-500 rounded transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Processing: {Math.round(uploadProgress)}%</p>
            </div>
          )}
          <div className="mt-2 grid grid-cols-4 gap-2">
            {imageUploads.map((upload, index) => (
              <div key={index} className="relative w-full h-24">
                {upload.preview && (
                  <Image
                    src={upload.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 25vw, 20vw"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Car Model & Variant*</label>
          <input
            type="text"
            required
            placeholder="e.g., Jeep Compass 2.0 Limited Option"
            className="w-full p-2 border rounded"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Model Year*</label>
          <input
            type="number"
            required
            min={1900}
            max={new Date().getFullYear() + 1}
            className="w-full p-2 border rounded"
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Version Info*</label>
          <input
            type="text"
            required
            placeholder="e.g., version-Compass 2.0 Limited"
            className="w-full p-2 border rounded"
            value={formData.info}
            onChange={(e) => setFormData(prev => ({ ...prev, info: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price (₹)*</label>
          <input
            type="number"
            required
            min={0}
            placeholder="Enter price in rupees"
            className="w-full p-2 border rounded"
            value={formData.price || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Featured Listing</label>
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-500"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 
                   transition disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </>
          ) : (
            'Create Listing'
          )}
        </button>
      </form>
    </div>
  )
}