import axios from 'axios';
import axiosRetry from 'axios-retry';
import { BASE_URL } from '../config';

/**
 * Global API Interceptor System
 * This script patches window.fetch and axios to ensure:
 * 1. JWT tokens are automatically attached.
 * 2. Role-specific headers (employee_id) are included.
 * 3. Base URLs are consistent.
 * 4. Automatic retry on failures.
 */

const setupInterceptors = () => {
  // Automatically retry failed requests up to 3 times silently
  axiosRetry(axios, { 
    retries: 3, 
    retryDelay: (retryCount) => {
      return retryCount * 1000; // Wait 1s, then 2s, then 3s between retries
    },
    retryCondition: (error) => {
      // Retry if the server crashes (5xx errors) or network disconnects
      return error.response?.status >= 500 || !error.response;
    }
  });

  // 1. Axios Global Interceptor
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || 
                  JSON.parse(localStorage.getItem('navAuthUser') || '{}').token;
    const userStr = localStorage.getItem('user') || localStorage.getItem('navAuthUser');
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {}

    // Set Base URL if relative
    if (config.url && !config.url.startsWith('http')) {
      const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
      config.url = `${base}${path}`;
    }

    // Attach Headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const empId = user?.employee_id || user?.empId || user?.userId || user?.id;
    if (empId) {
      config.headers['x-employee-id'] = empId;
    }
    if (user?.role) {
      let role = user.role;
      const lower = String(role).toLowerCase();
      if (lower.includes('lead') || lower === 'tl' || lower.includes('team leader') || lower.includes('teamleader')) {
        role = 'Project Manager';
      }
      config.headers['x-user-role'] = role;
    }

    return config;
  });

  // 2. Fetch Global Interceptor (Monkey Patch)
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    
    // Normalize config
    config = config || {};
    config.headers = config.headers || {};

    const token = localStorage.getItem('token') || 
                  JSON.parse(localStorage.getItem('navAuthUser') || '{}').token;
    const userStr = localStorage.getItem('user') || localStorage.getItem('navAuthUser');
    let user = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {}

    // Handle relative URLs
    if (typeof resource === 'string' && !resource.startsWith('http')) {
      // Ensure we don't double slash
      const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      const path = resource.startsWith('/') ? resource : `/${resource}`;
      resource = `${base}${path}`;
    }

    // Attach Headers (don't overwrite if already set)
    if (token && !config.headers['Authorization'] && !config.headers['authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Role-specific identifiers
    const empId = user?.employee_id || user?.empId || user?.userId || user?.id;
    if (empId && !config.headers['x-employee-id']) {
      config.headers['x-employee-id'] = empId;
    }
    if (user?.role && !config.headers['x-user-role']) {
      let role = user.role;
      const lower = String(role).toLowerCase();
      if (lower.includes('lead') || lower === 'tl' || lower.includes('team leader') || lower.includes('teamleader')) {
        role = 'Project Manager';
      }
      config.headers['x-user-role'] = role;
    }

    return originalFetch(resource, config);
  };

  console.log('🚀 [API Interceptor] Globally active.');
};

export default setupInterceptors;
