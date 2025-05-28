
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
 * Custom Zod validator for UUID fields
 */
export const uuidValidation = (fieldName: string = "UUID") => ({
  required_error: `${fieldName} est requis`,
  invalid_type_error: `${fieldName} doit être une chaîne de caractères`,
}).refine((value: string) => isValidUUIDAny(value), {
  message: `${fieldName} doit être un UUID valide (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)`,
});

/**
 * Generates a random UUID v4
 * @returns string - A valid UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};
