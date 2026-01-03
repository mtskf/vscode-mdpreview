export const urlTransform = (url: string, basePath?: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) {
      return url;
  }
  // Relative path resolution
  if (basePath) {
    try {
      const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
      return new URL(url, base).toString();
    } catch (e) {
      console.warn('Failed to resolve relative URL:', url, e);
      return url;
    }
  }
  return url;
};
