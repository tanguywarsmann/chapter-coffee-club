
import { useEffect, useState } from 'react';

interface ImageDebugProps {
  src: string;
  name: string;
}

export const ImageDebug = ({ src, name }: ImageDebugProps) => {
  const [exists, setExists] = useState<boolean | null>(null);
  const [webpExists, setWebpExists] = useState<boolean | null>(null);
  const [avifExists, setAvifExists] = useState<boolean | null>(null);

  useEffect(() => {
    // Vérifier l'image originale
    const img = new Image();
    img.onload = () => setExists(true);
    img.onerror = () => setExists(false);
    img.src = src;

    // Vérifier WebP
    if (src.includes('.png') || src.includes('.jpg') || src.includes('.jpeg')) {
      const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
      const webpImg = new Image();
      webpImg.onload = () => setWebpExists(true);
      webpImg.onerror = () => setWebpExists(false);
      webpImg.src = webpSrc;

      // Vérifier AVIF
      const avifSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.avif');
      const avifImg = new Image();
      avifImg.onload = () => setAvifExists(true);
      avifImg.onerror = () => setAvifExists(false);
      avifImg.src = avifSrc;
    }
  }, [src]);

  return (
    <div className="p-2 bg-gray-100 text-xs font-mono">
      <div><strong>{name}:</strong></div>
      <div>Original: {exists === null ? '⏳' : exists ? '✅' : '❌'} {src}</div>
      {webpExists !== null && (
        <div>WebP: {webpExists ? '✅' : '❌'} {src.replace(/\.(png|jpg|jpeg)$/i, '.webp')}</div>
      )}
      {avifExists !== null && (
        <div>AVIF: {avifExists ? '✅' : '❌'} {src.replace(/\.(png|jpg|jpeg)$/i, '.avif')}</div>
      )}
    </div>
  );
};
