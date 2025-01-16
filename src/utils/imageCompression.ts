export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Only compress files over 50MB
  if (file.size <= 50 * 1024 * 1024) {
    console.log('File under 50MB, keeping original quality');
    return file;
  }

  const imageCompression = (await import('browser-image-compression')).default;
  
  // Extremely light compression for very large files
  const targetSizeMB = Math.min(file.size / (1024 * 1024) * 0.99, 50); // Only 1% reduction, max 50MB

  // Always maximum quality
  const options = {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight: 15000,           // Extremely high resolution limit
    useWebWorker: true,
    initialQuality: 1.0,               // Maximum quality always
    alwaysKeepResolution: true,        // Never reduce resolution
    fileType: file.type,
    preserveExif: true,
    useMozJpeg: true,                 // Best quality JPEG encoding
    watermark: {
      enable: false,
    },
    // Maximum quality settings
    exifOrientation: true,
    strict: true,
    checkOrientation: true,
    maxIteration: 100,                 // Maximum possible iterations for best quality
    progressive: file.type === 'image/jpeg' || file.type === 'image/jpg',
  };

  try {
    let compressedFile = await imageCompression(file, options);
    
    // Extremely strict quality check
    if (compressedFile.size < file.size * 0.98) { // If compressed more than 2%
      console.log('Preserving original quality, compression skipped');
      return file; // Return original to maintain quality
    }

    // Always keep original for these formats
    if (file.type === 'image/png' || 
        file.type.includes('raw') || 
        file.type === 'image/tiff' ||
        file.type === 'image/webp') {
      console.log('High quality format detected, preserving original');
      return file;
    }

    return new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.error('Error during compression attempt:', error);
    // Return original file on any error
    return file;
  }
}