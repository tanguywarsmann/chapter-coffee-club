
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // Pour les images critiques (au-dessus du pli)
  sizes?: string; // Pour le responsive
}

const Image = ({ src, alt, className, priority = false, sizes, ...props }: ImageProps) => {
  // Fonction pour générer les chemins des versions optimisées
  const getOptimizedSources = (originalSrc: string) => {
    // Ne pas optimiser les URLs externes ou les data URLs
    if (originalSrc.startsWith('http') || originalSrc.startsWith('data:')) {
      return { avif: null, webp: null };
    }

    // Extraire le chemin et l'extension
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

  // Si on a des versions optimisées, utiliser <picture>
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
      {...props}
    />
  );
};

export default Image;
