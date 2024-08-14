export const testEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

export const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const extractVideoId = (url: string) => {
  return url.split("v=")[1].split("&")[0];
};

export const getYouTubeThumbnail = (id: string) => {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
};
