export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Only compress files over 100MB to preserve quality for most images
  if (file.size <= 100 * 1024 * 1024) {
    console.log('File under 100MB, preserving original quality');
    return file;
  }

  const { default: imageCompression } = await import('browser-image-compression');
  
  // Ultra-light compression - only 0.5% reduction
  const targetSizeMB = Math.min(file.size / (1024 * 1024) * 0.995, 100); // Only 0.5% reduction, max 100MB

  const options = {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight: 20000,           // Even higher resolution limit
    useWebWorker: true,
    initialQuality: 1.0,               // Maximum initial quality
    alwaysKeepResolution: true,        // Never reduce resolution
    fileType: file.type as string,
    preserveExif: true,
    useMozJpeg: true,                  // Best quality JPEG encoding
    watermark: {
      enable: false,
    },
    // Ultra-high quality settings
    strict: true,
    checkOrientation: true,
    maxIteration: 150,                 // More iterations for better quality
    progressive: file.type === 'image/jpeg' || file.type === 'image/jpg',
    // Additional quality-preserving options
    exifOrientation: true,             // Preserve image orientation
    fastDecodingSize: 0,              // Disable fast decoding to maintain quality
  };

  try {
    const compressedFile = await imageCompression(file, options) as File;
    
    // Even stricter quality preservation check - only accept 0.5% reduction
    if (compressedFile.size < file.size * 0.995) {
      console.log('Compression exceeded quality threshold, preserving original');
      return file;
    }

    // Expanded list of formats to preserve original quality
    if (file.type === 'image/png' || 
        file.type.includes('raw') || 
        file.type === 'image/tiff' ||
        file.type === 'image/webp' ||
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        file.type.includes('adobe')) {
      console.log('High quality format detected, preserving original');
      return file;
    }

    // Additional quality check for JPEG/JPG
    if ((file.type === 'image/jpeg' || file.type === 'image/jpg') && 
        compressedFile.size < file.size * 0.998) { // Even stricter for JPEG
      console.log('JPEG quality threshold exceeded, preserving original');
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