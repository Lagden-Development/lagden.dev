export const ensureHttps = (url: string) => {
  if (url.startsWith('//')) return `https:${url}`;
  if (!url.startsWith('http')) return `https://${url}`;
  return url;
};
