
import React, { useState, useEffect } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const Image = ({ src, alt, className, priority = false, sizes, ...props }: ImageProps) => {
  const [fallbackToOriginal, setFallbackToOriginal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Pour les URLs externes ou data URLs, utiliser l'image directement
  if (src.startsWith('http') || src.startsWith('data:')) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        onError={() => setImageError(true)}
        {...props}
      />
    );
  }

  // Fonction pour générer les chemins des versions optimisées
  const getOptimizedSources = (originalSrc: string) => {
    const lastDotIndex = originalSrc.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return { avif: null, webp: null };
    }

    const basePath = originalSrc.substring(0, lastDotIndex);
    const extension = originalSrc.substring(lastDotIndex);

    // Générer les chemins uniquement pour les formats supportés
    if (['.jpg', '.jpeg', '.png'].includes(extension.toLowerCase())) {
      return {
        avif: `${basePath}.avif`,
        webp: `${basePath}.webp`
      };
    }

    return { avif: null, webp: null };
  };

  const { avif, webp } = getOptimizedSources(src);

  // Si on doit fallback sur l'original ou si les versions optimisées ne sont pas disponibles
  if (fallbackToOriginal || imageError) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        sizes={sizes}
        onError={() => {
          console.warn(`Image failed to load: ${src}`);
          setImageError(true);
        }}
        {...props}
      />
    );
  }

  // Gestionnaire d'erreur pour les sources optimisées
  const handleOptimizedError = () => {
    console.log(`Optimized versions not available for ${src}, falling back to original`);
    setFallbackToOriginal(true);
  };

  // Si on a des versions optimisées, essayer de les utiliser avec fallback robuste
  if (avif || webp) {
    return (
      <picture>
        {avif && (
          <source 
            srcSet={avif} 
            type="image/avif" 
            sizes={sizes}
          />
        )}
        {webp && (
          <source 
            srcSet={webp} 
            type="image/webp" 
            sizes={sizes}
          />
        )}
        <img 
          src={src} 
          alt={alt} 
          className={className} 
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes={sizes}
          onError={handleOptimizedError}
          {...props}
        />
      </picture>
    );
  }

  // Sinon, utiliser l'image normale
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      sizes={sizes}
      onError={() => {
        console.warn(`Image failed to load: ${src}`);
        setImageError(true);
      }}
      {...props}
    />
  );
};

export default Image;
