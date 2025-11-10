const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if( imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  } 
  return `${API_URL}/${imagePath}`;
}

export  {getImageUrl};