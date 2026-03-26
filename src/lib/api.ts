/**
 * API utility for authenticated requests
 * Automatically includes JWT token in Authorization header
 */

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiCall(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Get token from localStorage (set during login)
  // For actual production, consider storing in secure storage
  const token = typeof window !== 'undefined' ? 
    localStorage.getItem('auth_token') : null;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    credentials: 'include', // Include cookies (for httpOnly cookie)
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Clear stored token and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      window.location.href = '/admin/login';
    }
  }

  return response;
}

export async function apiGet(endpoint: string, options: FetchOptions = {}) {
  return apiCall(endpoint, { ...options, method: 'GET' });
}

export async function apiPost(endpoint: string, data?: any, options: FetchOptions = {}) {
  return apiCall(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiPut(endpoint: string, data?: any, options: FetchOptions = {}) {
  return apiCall(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function apiDelete(endpoint: string, options: FetchOptions = {}) {
  return apiCall(endpoint, { ...options, method: 'DELETE' });
}
