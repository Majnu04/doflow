/**
 * Retry utility for failed async operations with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} delay - Initial delay in milliseconds (default: 1000)
 * @returns {Promise} - Result of successful execution
 */
export const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      const status = error.response?.status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        throw error;
      }

      // Last attempt - don't wait, just throw
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff: delay * 2^attempt
      const backoffDelay = delay * Math.pow(2, attempt);
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${backoffDelay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError;
};
