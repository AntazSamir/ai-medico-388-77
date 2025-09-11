import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useMobilePerformance } from '@/hooks/use-mobile-performance';

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * Mobile-optimized virtual scrolling component for large lists
 * Reduces memory usage and improves performance on mobile devices
 */
export const VirtualScroll = memo(<T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
}: VirtualScrollProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const { isMobile, isLowEndDevice, throttle } = useMobilePerformance();

  // Calculate visible range with mobile optimizations
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );
    
    // Reduce overscan on low-end devices
    const actualOverscan = isLowEndDevice ? Math.min(overscan, 2) : overscan;
    
    return {
      start: Math.max(0, startIndex - actualOverscan),
      end: Math.min(items.length - 1, endIndex + actualOverscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan, isLowEndDevice]);

  // Throttled scroll handler for better mobile performance
  const throttledScrollHandler = useCallback(
    throttle((event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop);
    }, isMobile ? 16 : 8), // 60fps on mobile, 120fps on desktop
    [throttle, isMobile]
  );

  // Visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // Offset for visible items
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={throttledScrollHandler}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.start + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: itemHeight,
                  // Optimize rendering for mobile
                  willChange: isMobile ? 'auto' : 'transform',
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

VirtualScroll.displayName = 'VirtualScroll';

export default VirtualScroll;
