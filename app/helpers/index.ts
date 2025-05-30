export const ensureHttps = (url: string) => {
  // Return null for empty, null, undefined, or invalid URLs
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return null;
  }

  // Handle protocol-relative URLs
  if (url.startsWith('//')) return `https:${url}`;

  // Handle URLs without protocol
  if (!url.startsWith('http')) {
    // Don't add https:// to obviously invalid URLs
    if (url.includes(' ') || url.length < 3) {
      return null;
    }
    return `https://${url}`;
  }

  return url;
};
