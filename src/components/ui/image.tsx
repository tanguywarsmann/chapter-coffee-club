
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // Pour les images critiques (au-dessus du pli)
}

const Image = ({ src, alt, className, priority = false, ...props }: ImageProps) => {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...props}
    />
  );
};

export default Image;
