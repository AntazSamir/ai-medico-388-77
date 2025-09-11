import { useEffect, useState, useCallback } from 'react';

/**
 * Mobile Performance Hook
 * Optimizes app performance for mobile devices
 */
export function useMobilePerformance() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [connectionType, setConnectionType] = useState<'slow' | 'fast' | 'unknown'>('unknown');

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect low-end device based on hardware concurrency and memory
  useEffect(() => {
    const checkLowEndDevice = () => {
      const cores = navigator.hardwareConcurrency || 4;
      const memory = (navigator as any).deviceMemory || 4;
      const isLowEnd = cores <= 2 || memory <= 2;
      setIsLowEndDevice(isLowEnd);
    };

    checkLowEndDevice();
  }, []);

  // Detect connection type
  useEffect(() => {
    const checkConnection = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnectionType('slow');
        } else if (effectiveType === '3g' || effectiveType === '4g') {
          setConnectionType('fast');
        } else {
          setConnectionType('unknown');
        }
      } else {
        setConnectionType('unknown');
      }
    };

    checkConnection();
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', checkConnection);
      return () => connection.removeEventListener('change', checkConnection);
    }
  }, []);

  // Debounced function for performance-critical operations
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Throttled function for scroll/resize events
  const throttle = useCallback((func: Function, delay: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(null, args);
      }
    };
  }, []);

  // Optimize animations based on device capabilities
  const shouldReduceMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches || isLowEndDevice;
  }, [isLowEndDevice]);

  // Get optimal image quality based on connection
  const getImageQuality = useCallback(() => {
    if (connectionType === 'slow' || isLowEndDevice) {
      return 'low';
    }
    return 'high';
  }, [connectionType, isLowEndDevice]);

  return {
    isMobile,
    isLowEndDevice,
    connectionType,
    debounce,
    throttle,
    shouldReduceMotion,
    getImageQuality,
  };
}

/**
 * Hook for optimizing component rendering on mobile
 */
export function useMobileOptimization() {
  const { isMobile, isLowEndDevice, shouldReduceMotion } = useMobilePerformance();
  
  // Reduce re-renders on mobile
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    if (isMobile) {
      // Limit re-renders on mobile devices
      const maxRenders = isLowEndDevice ? 10 : 20;
      if (renderCount > maxRenders) {
        console.warn('High render count detected on mobile device');
      }
    }
  }, [renderCount, isMobile, isLowEndDevice]);

  const incrementRenderCount = useCallback(() => {
    setRenderCount(prev => prev + 1);
  }, []);

  return {
    isMobile,
    isLowEndDevice,
    shouldReduceMotion,
    incrementRenderCount,
    renderCount,
  };
}
