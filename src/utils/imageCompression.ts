import imageCompression from 'browser-image-compression';

const TARGET_MIN_SIZE = 50 * 1024; // 50KB in bytes
const TARGET_MAX_SIZE = 100 * 1024; // 100KB in bytes

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const compressWithQuality = async (quality: number): Promise<File> => {
    const options = {
      maxSizeMB: TARGET_MAX_SIZE / (1024 * 1024), // Convert to MB
      useWebWorker: true,
      initialQuality: quality,
      maxWidthOrHeight: 1920, // Full HD resolution
      fileType: 'image/jpeg', // Convert all images to JPEG for better compression
      alwaysKeepResolution: false
    };

    return await imageCompression(file, options) as File;
  };

  // Binary search for optimal quality
  let minQuality = 0;
  let maxQuality = 1;
  let bestResult: File | null = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 8; // Limit the number of attempts

  while (attempts < MAX_ATTEMPTS) {
    const quality = (minQuality + maxQuality) / 2;
    const result = await compressWithQuality(quality);
    
    console.log(`Attempt ${attempts + 1}: Quality ${quality.toFixed(2)}, Size: ${result.size / 1024}KB`);

    if (result.size >= TARGET_MIN_SIZE && result.size <= TARGET_MAX_SIZE) {
      return result;
    }

    if (result.size > TARGET_MAX_SIZE) {
      maxQuality = quality;
    } else {
      minQuality = quality;
    }

    // Keep the best result (closest to target range)
    if (!bestResult || 
        Math.abs(result.size - TARGET_MIN_SIZE) < Math.abs(bestResult.size - TARGET_MIN_SIZE)) {
      bestResult = result;
    }

    attempts++;
  }

  // Return the best result if we couldn't hit the exact range
  return bestResult || file;
}