import imageCompression from 'browser-image-compression';

const TARGET_MIN_KB = 50;
const TARGET_MAX_KB = 100;
const MAX_ATTEMPTS = 8;

export async function compressImage(file: File): Promise<File> {
  try {
    const originalSize = file.size / 1024;
    console.log(`Starting compression for ${file.name} (${originalSize.toFixed(2)} KB)`);

    // If already in range, return original
    if (originalSize >= TARGET_MIN_KB && originalSize <= TARGET_MAX_KB) {
      return file;
    }

    let bestResult: File = file;
    let bestSizeDiff = Infinity;
    let attempts = 0;
    let quality = originalSize > TARGET_MAX_KB ? 0.7 : 0.9;

    while (attempts < MAX_ATTEMPTS) {
      const options = {
        maxSizeMB: originalSize > TARGET_MAX_KB ? 0.1 : 0.2,
        useWebWorker: true,
        maxWidthOrHeight: 1920,
        initialQuality: quality,
        fileType: 'image/jpeg',
        alwaysKeepResolution: true
      };

      const compressed = await imageCompression(file, options);
      const compressedSize = compressed.size / 1024;
      const sizeDiff = Math.abs((TARGET_MIN_KB + TARGET_MAX_KB) / 2 - compressedSize);

      console.log(`Attempt ${attempts + 1}: Size=${compressedSize.toFixed(2)}KB, Quality=${quality.toFixed(2)}`);

      if (compressedSize >= TARGET_MIN_KB && compressedSize <= TARGET_MAX_KB) {
        return compressed;
      }

      // Keep track of best result
      if (sizeDiff < bestSizeDiff) {
        bestResult = compressed;
        bestSizeDiff = sizeDiff;
      }

      // Adjust quality based on result
      if (compressedSize > TARGET_MAX_KB) {
        quality *= 0.8;
      } else {
        quality = Math.min(quality * 1.2, 1.0);
      }

      attempts++;
    }

    // If we couldn't get exact range, return best attempt
    console.log(`Using best attempt for ${file.name}: ${(bestResult.size / 1024).toFixed(2)} KB`);
    return bestResult;

  } catch (error) {
    console.error(`Error compressing ${file.name}:`, error);
    // Return original file if compression fails
    return file;
  }
}