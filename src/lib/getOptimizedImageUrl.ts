export function getOptimizedImageUrl(
  fullPath: string,
  opts: { width: number; quality?: number } = { width: 800, quality: 75 }
) {
  const { width, quality = 75 } = opts;
  
  // Si l'URL est déjà complète, extraire le chemin
  if (fullPath.includes('supabase.co')) {
    const url = new URL(fullPath);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (pathMatch) {
      const bucket = pathMatch[1];
      const filePath = pathMatch[2];
      return `https://xjumsrjuyzvsixvfwoiz.supabase.co/storage/v1/render/image/public/${bucket}/${filePath}?width=${width}&quality=${quality}&format=webp`;
    }
  }

  // Si c'est juste un chemin (ex: "blog-images/mon-image.jpg")
  return `https://xjumsrjuyzvsixvfwoiz.supabase.co/storage/v1/render/image/public/${fullPath}?width=${width}&quality=${quality}&format=webp`;
}