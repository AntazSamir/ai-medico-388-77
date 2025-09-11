import { useState, useCallback, memo } from 'react';
import { useMobilePerformance } from '@/hooks/use-mobile-performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  fallback?: string;
}

/**
 * Mobile-optimized image component with lazy loading and performance enhancements
 */
export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder,
  fallback = '/placeholder.svg',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { isMobile, isLowEndDevice, getImageQuality } = useMobilePerformance();

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  // Generate optimized image URL based on device capabilities
  const getOptimizedSrc = useCallback(() => {
    if (hasError) return fallback;
    
    const quality = getImageQuality();
    const isWebP = typeof window !== 'undefined' && 
      window.navigator.userAgent.includes('Chrome') && 
      !window.navigator.userAgent.includes('Edge');
    
    // For mobile devices, use smaller images
    if (isMobile && width && height) {
      const mobileWidth = Math.min(width, 400);
      const mobileHeight = Math.min(height, 400);
      
      // If using a service like Cloudinary or similar, add optimization parameters
      if (src.includes('cloudinary') || src.includes('imagekit')) {
        const params = new URLSearchParams();
        params.set('w', mobileWidth.toString());
        params.set('h', mobileHeight.toString());
        params.set('q', quality === 'low' ? '60' : '80');
        params.set('f', isWebP ? 'webp' : 'auto');
        
        return `${src}?${params.toString()}`;
      }
    }
    
    return src;
  }, [src, hasError, fallback, isMobile, width, height, getImageQuality]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder ? (
            <img 
              src={placeholder} 
              alt="" 
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-medical-500 rounded-full animate-spin" />
          )}
        </div>
      )}
      
      {/* Main image */}
      <img
        src={getOptimizedSrc()}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${isLowEndDevice ? 'filter-none' : ''}
        `}
        style={{
          // Optimize rendering for mobile
          imageRendering: isLowEndDevice ? 'auto' : 'crisp-edges',
          // Prevent layout shift
          aspectRatio: width && height ? `${width} / ${height}` : undefined,
        }}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 mx-auto mb-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
