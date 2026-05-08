import { BASE_URL } from '../config';

/**
 * Unified API Request Helper
 * Automatically handles:
 * 1. Base URL prepending
 * 2. Authorization headers (JWT)
 * 3. Role-specific headers (employee_id)
 * 4. JSON parsing
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(user?.employee_id ? { 'x-employee-id': user.employee_id } : {}),
    ...(user?.role ? { 'x-user-role': user.role } : {}),
    ...(options.headers || {})
  };

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Handle unauthorized - maybe logout or redirect
    console.warn('API Unauthorized (401).');
  }

  return response;
};

export default apiRequest;
