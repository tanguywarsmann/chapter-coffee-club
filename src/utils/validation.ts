
import { z } from "zod";

/**
 * Utilities for client-side validation
 */

/**
 * Validates if a string is a valid UUID v4 format
 * @param value - The string to validate
 * @returns boolean - true if valid UUID v4, false otherwise
 */
export const isValidUUID = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validates if a string is a valid UUID (any version)
 * @param value - The string to validate
 * @returns boolean - true if valid UUID, false otherwise
 */
export const isValidUUIDAny = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validates if a string is a valid UUID v4 format (strict)
 * @param value - The string to validate
 * @returns boolean - true if valid UUID v4, false otherwise
 */
export const isUuidV4 = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/**
 * Zod schema for UUID validation
 */
export const uuidSchema = z
  .string({
    required_error: "UUID requis",
    invalid_type_error: "Type invalide"
  })
  .refine(isUuidV4, {
    message: "UUID invalide"
  });

/**
 * Schéma Zod pour l'ajout de livre
 */
export const addBookSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().min(1, "L'auteur est requis"),
  total_pages: z.coerce.number().min(1, "Le nombre de pages est requis"),
  description: z.string().optional(),
  cover_url: z.string().optional(),
  is_published: z.boolean().default(true),
});

/**
 * Schéma Zod pour l'ajout de question
 */
export const addQuestionSchema = z.object({
  book_slug: z.string().min(1, "Le slug du livre est requis"),
  segment: z.coerce.number().min(0, "Le numéro de segment doit être positif"),
  question: z.string().min(1, "La question est requise"),
  answer: z.string().min(1, "La réponse est requise").refine(
    (value) => value.trim().split(/\s+/).length === 1,
    "La réponse doit contenir un seul mot"
  ),
});

/**
 * Schéma Zod pour la métadonnée de livre
 */
export const bookMetadataSchema = z.object({
  total_pages: z.coerce.number().min(1, "Le nombre de pages est requis"),
  description: z.string().optional(),
  is_published: z.boolean().default(true),
});

/**
 * Generates a random UUID v4
 * @returns string - A valid UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};
