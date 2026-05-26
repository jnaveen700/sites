// API Configuration - use env config with safe fallback for local development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Health check to verify backend connectivity
export const checkApiHealth = async () => {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error.message);
    return false;
  }
};
