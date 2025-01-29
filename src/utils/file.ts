/**
 * Sanitizes a filename for URL compatibility while preserving case, slashes, and dots
 * @param fileName Original filename
 * @returns URL-safe filename
 */
export function sanitizeFileName(fileName: string): string {
  // Only sanitize characters that would cause issues in URLs
  return fileName
    .replace(/[<>:"|?*]/g, '-') // Replace truly problematic characters with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with a single one
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}
