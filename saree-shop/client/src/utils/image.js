export const getImageUrl = (img) => {
  if (typeof img === 'string') return img;
  return img?.url || '/placeholder.jpg';
};