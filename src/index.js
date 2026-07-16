// Intercept localStorage to redirect Auth-related keys to sessionStorage
// This ensures that multiple tabs/windows can run different user/role sessions without overwriting each other.
(function() {
  if (typeof window === 'undefined') return;

  const authKeys = new Set(['token', 'user', 'navAuthUser', 'userRole']);
  const originalGetItem = localStorage.getItem.bind(localStorage);
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);

  localStorage.getItem = function(key) {
    if (authKeys.has(key)) {
      return sessionStorage.getItem(key);
    }
    return originalGetItem(key);
  };

  localStorage.setItem = function(key, value) {
    if (authKeys.has(key)) {
      return sessionStorage.setItem(key, value);
    }
    return originalSetItem(key, value);
  };

  localStorage.removeItem = function(key) {
    if (authKeys.has(key)) {
      return sessionStorage.removeItem(key);
    }
    return originalRemoveItem(key);
  };

  const originalClear = localStorage.clear.bind(localStorage);
  localStorage.clear = function() {
    authKeys.forEach(key => sessionStorage.removeItem(key));
    originalClear();
  };
})();

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import setupInterceptors from './services/apiInterceptor';

// Initialize global API interception
setupInterceptors();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
