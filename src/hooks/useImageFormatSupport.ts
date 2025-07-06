
import { useState, useEffect } from 'react';

interface ImageFormatSupport {
  webp: boolean;
  avif: boolean;
}

export const useImageFormatSupport = (): ImageFormatSupport => {
  const [support, setSupport] = useState<ImageFormatSupport>({
    webp: false,
    avif: false
  });

  useEffect(() => {
    const checkWebPSupport = () => {
      return new Promise<boolean>((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
          resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });
    };

    const checkAVIFSupport = () => {
      return new Promise<boolean>((resolve) => {
        const avif = new Image();
        avif.onload = avif.onerror = () => {
          resolve(avif.height === 2);
        };
        avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABoAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
      });
    };

    Promise.all([checkWebPSupport(), checkAVIFSupport()]).then(([webp, avif]) => {
      setSupport({ webp, avif });
    });
  }, []);

  return support;
};
