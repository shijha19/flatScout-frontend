// Environment utility to handle environment variables consistently
export const getApiUrl = () => {
  // Force re-evaluation of environment variables on each call
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Add some debugging for development
  if (!apiUrl && import.meta.env.DEV) {
    console.warn('VITE_API_URL is not set. Google OAuth will not be available.');
  }
  
  return apiUrl || '';
};

// Force environment variable refresh (for debugging cache issues)
export const refreshEnvironment = () => {
  // In development, this can help with cache issues
  if (import.meta.env.DEV) {
    console.log('Environment check:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    });
  }
};

// Check if OAuth is available
export const isOAuthAvailable = () => {
  return Boolean(getApiUrl());
};
