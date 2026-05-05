const BASE_URL = 'http://localhost:3001/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important for cookies
  };

  const response = await fetch(url, config);
  
  const data = await response.json();

  if (!response.ok || data.success === false) {
    const error = data.error || { message: 'Something went wrong' };
    throw new Error(error.message || 'API request failed');
  }

  return data.data;
}
