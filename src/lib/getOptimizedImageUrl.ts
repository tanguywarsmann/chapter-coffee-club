/**
 * Retourne une URL optimisée via Supabase `/render/image`.
 *  - Accepte soit le *chemin* (ex. "blog/roman.jpg")
 *  - soit l'URL absolue Supabase (ex. "https://xyz.supabase.co/storage/v1/object/public/blog/roman.jpg")
 */
export function getOptimizedImageUrl(
  src: string,
  opts: { width: number; quality?: number } = { width: 800, quality: 75 }
) {
  const { width, quality = 75 } = opts;

  // ① Cas URL absolue ➜ on transforme "/object/" ➜ "/render/image/"
  if (src.startsWith('http')) {
    return src
      .replace('/storage/v1/object/', '/storage/v1/render/image/')
      + `?width=${width}&quality=${quality}&format=webp`;
  }

  // ② Cas chemin "bucket/path.jpg"
  const base = 'https://xjumsrjuyzvsixvfwoiz.supabase.co';
  return `${base}/storage/v1/render/image/public/${src}?width=${width}&quality=${quality}&format=webp`;
}