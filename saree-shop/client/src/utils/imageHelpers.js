export const getImageUrl = (img) => {
  if (!img) return '/placeholder.jpg';
  if (typeof img === 'string') return img;
  if (typeof img === 'object') {
    return img.url || img.secure_url || '/placeholder.jpg';
  }
  return '/placeholder.jpg';
};

export const normalizeImages = (images) => {
  if (!Array.isArray(images)) return [];
  return images.filter(Boolean);
};

export const isRenderable = (value) => typeof value === 'string' || typeof value === 'number';

export const renderTextValue = (value, fallback = '') => {
  if (isRenderable(value)) return value;
  return fallback;
};