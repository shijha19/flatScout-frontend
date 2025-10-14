// Environment utility to handle environment variables consistently
export const getApiUrl = () => {
  // Get the API URL from environment variables
  let apiUrl = import.meta.env.VITE_API_URL;
  
  // Fallback for production if environment variable is not working
  if (!apiUrl && typeof window !== 'undefined') {
    // In production, try to get from a global variable if set
    apiUrl = window.__VITE_API_URL__;
  }
  
  // Last resort fallback for your specific deployment
  if (!apiUrl && import.meta.env.PROD) {
    console.warn('VITE_API_URL not found, using fallback');
    apiUrl = 'https://flatscout-backend-2.onrender.com';
  }
  
  // Clean up the URL - remove any extra protocols or malformed parts
  if (apiUrl) {
    // Remove the variable name if it's included in the value (Netlify bug)
    apiUrl = apiUrl.replace(/^VITE_API_URL=/, '');
    // Remove any duplicate protocol or malformed parts
    apiUrl = apiUrl.replace(/^.*?https:\/\//, 'https://');
    // Ensure no trailing slash
    apiUrl = apiUrl.replace(/\/$/, '');
  }
  
  // Debug logging
  console.log('Environment debug:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    cleanedApiUrl: apiUrl,
    allEnv: import.meta.env
  });
  
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
