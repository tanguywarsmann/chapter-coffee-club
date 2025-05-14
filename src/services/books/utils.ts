
/**
 * Convertit une chaîne en format slug URL-friendly
 * @param str Chaîne à convertir en slug
 * @returns Slug URL-friendly
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};
