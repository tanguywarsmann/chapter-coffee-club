
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const Image = ({ src, alt, className, priority = false, sizes, ...props }: ImageProps) => {
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

  // Si on a des versions optimisées, utiliser <picture> avec gestion d'erreur
  if (avif || webp) {
    return (
      <picture>
        {avif && (
          <source 
            srcSet={avif} 
            type="image/avif" 
            sizes={sizes}
            onError={(e) => {
              // Masquer la source AVIF si elle échoue
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        {webp && (
          <source 
            srcSet={webp} 
            type="image/webp" 
            sizes={sizes}
            onError={(e) => {
              // Masquer la source WebP si elle échoue
              e.currentTarget.style.display = 'none';
            }}
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
