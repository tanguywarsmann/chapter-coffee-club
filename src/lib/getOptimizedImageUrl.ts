/**
 * Construit une URL optimisée via Supabase `/render/image`.
 * - Accepte un chemin relatif (ex. "blog-images/roman.jpg")
 * - ou une URL absolue (ex. "https://xyz.supabase.co/storage/v1/object/public/blog-images/roman.jpg")
 * Ajoute width / quality / format=webp et supprime les doubles « // ».
 */
export function getOptimizedImageUrl(
  src: string,
  opts: { width: number; quality?: number } = { width: 800, quality: 75 }
) {
  const { width, quality = 75 } = opts;

  /** normalise et évite les “//” hors protocole */
  const squash = (url: string) => url.replace(/([^:]\/)\/+/g, '$1');

  // ── ① URL absolue Supabase déjà complète ──────────────────────────
  if (src.startsWith('http')) {
    const transformed = src.replace(
      '/storage/v1/object/',
      '/storage/v1/render/image/'
    );
    return squash(`${transformed}?width=${width}&quality=${quality}&format=webp`);
  }

  // ── ② Chemin relatif “bucket/fichier.jpg” ─────────────────────────
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return squash(
    `${base}/storage/v1/render/image/public/${src}?width=${width}&quality=${quality}&format=webp`
  );
}
