/**
 * Transforme une chaîne de caractères en slug URL-friendly
 * Exemple: "Paris Saint-Germain FC" -> "paris-saint-germain-fc"
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD") // Sépare les accents des lettres
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/[^\w-]+/g, "") // Supprime tout ce qui n'est pas alphanumérique
    .replace(/--+/g, "-") // Évite les doubles tirets
    .trim();
};
