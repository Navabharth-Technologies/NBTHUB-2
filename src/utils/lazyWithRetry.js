import { lazy } from 'react';

/**
 * A wrapper around React.lazy that automatically retries the import if a chunk load fails.
 * This is crucial in single-page apps during development recompiles or new production deployments,
 * where older chunk files are replaced by new ones on the server.
 */
export const lazyWithRetry = (componentImport) => {
  return lazy(() => 
    componentImport().catch((error) => {
      // Check if it's a ChunkLoadError or contains loading chunk/css/js failed
      const isChunkLoadError = 
        error.name === 'ChunkLoadError' || 
        /loading\s+chunk\s+.*\s+failed/i.test(error.message) ||
        /failed\s+to\s+fetch/i.test(error.message);

      if (isChunkLoadError) {
        const sessionStorageKey = 'chunk-load-retry';
        const hasRetried = sessionStorage.getItem(sessionStorageKey);

        if (!hasRetried) {
          sessionStorage.setItem(sessionStorageKey, 'true');
          // Reload the window to fetch the updated assets
          window.location.reload();
          return new Promise(() => {}); // Return a pending promise to prevent rendering half-broken state
        }
      }

      // If we already retried or it's another type of error, reject/throw it
      throw error;
    })
  );
};

// Clear the retry flag when the bundle is loaded successfully
if (typeof window !== 'undefined') {
  try {
    sessionStorage.removeItem('chunk-load-retry');
  } catch (e) {
    console.warn('Unable to access sessionStorage:', e);
  }
}
