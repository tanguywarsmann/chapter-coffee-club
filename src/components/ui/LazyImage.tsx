import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}

/**
 * FIX P0-6: Lazy loading component for images
 * Uses Intersection Observer to load images only when visible
 */
export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  skeletonClassName = 'bg-gray-200' 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Précharger 200px avant
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView ? (
        <img
          src={src}
          alt={alt}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <div 
          className={`${className} ${skeletonClassName} animate-pulse`}
          aria-label="Loading image..."
        />
      )}
    </div>
  );
};
