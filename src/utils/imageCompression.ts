export async function compressImage(file: File): Promise<File> {
    // Import the library dynamically to reduce initial bundle size
    const imageCompression = (await import('browser-image-compression')).default;
    
    const options = {
      maxSizeMB: 1,          // Maximum size in MB
      maxWidthOrHeight: 1920, // Max width/height of the output image
      useWebWorker: true,    // Use web workers for better performance
      initialQuality: 0.7,   // Initial quality of compression
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      // Create a new file with a more descriptive name
      return new File([compressedFile], file.name, {
        type: compressedFile.type,
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }