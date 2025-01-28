/**
 * Sanitizes a filename for URL compatibility
 * @param fileName Original filename
 * @returns URL-safe filename
 */
export function sanitizeFileName(fileName: string): string {
  // Handle special cases for common multi-dot extensions
  const multiDotExts = ['.tar.gz', '.min.js', '.min.css'];
  let name = fileName;
  let ext = '';

  // Check for multi-dot extensions first
  for (const multiExt of multiDotExts) {
    if (fileName.toLowerCase().endsWith(multiExt)) {
      const pos = fileName.toLowerCase().lastIndexOf(multiExt);
      name = fileName.slice(0, pos);
      ext = fileName.slice(pos);
      break;
    }
  }

  // If no multi-dot extension found, try to find a regular extension
  if (!ext) {
    const lastDot = fileName.lastIndexOf('.');
    const hasExtension = lastDot !== -1 && lastDot > 0 && lastDot < fileName.length - 1;

    if (hasExtension) {
      name = fileName.slice(0, lastDot);
      ext = fileName.slice(lastDot);
    } else {
      name = fileName;
      ext = '';
    }
  }

  // Sanitize the name part
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace any non-alphanumeric chars with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with a single one
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

  // Combine with the lowercase extension
  return sanitizedName + ext.toLowerCase();
}
