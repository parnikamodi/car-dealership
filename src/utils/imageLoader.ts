import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

interface ImageLoadingMetrics {
  totalTime: number;
  individualTimes: { [path: string]: number };
}

export async function loadImageUrls(paths: string[]): Promise<{urls: string[], metrics: ImageLoadingMetrics}> {
  if (!paths?.length) return { urls: [], metrics: { totalTime: 0, individualTimes: {} } };
  
  const startTime = performance.now();
  const metrics: ImageLoadingMetrics = {
    totalTime: 0,
    individualTimes: {}
  };

  try {
    const imagePromises = paths.map(async path => {
      const imageStartTime = performance.now();
      const url = await getDownloadURL(ref(storage, path));
      metrics.individualTimes[path] = performance.now() - imageStartTime;
      return url;
    });

    const urls = await Promise.all(imagePromises);
    metrics.totalTime = performance.now() - startTime;

    // Log performance metrics
    console.log('Image Loading Metrics:', {
      totalTime: `${metrics.totalTime.toFixed(2)}ms`,
      individualTimes: Object.fromEntries(
        Object.entries(metrics.individualTimes).map(([path, time]) => [
          path,
          `${time.toFixed(2)}ms`
        ])
      )
    });

    return { urls, metrics };
  } catch (error) {
    console.error('Error loading images:', error);
    return { urls: [], metrics };
  }
}