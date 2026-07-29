/**
 * Retry utility for Judge0 API calls
 * Implements exponential backoff for transient failures
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} initialDelay - Initial delay in milliseconds
 * @param {Array<number>} retryableStatusCodes - HTTP status codes to retry on
 * @returns {Promise} - Resolves with fn result or rejects after max retries
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  initialDelay = 1000,
  retryableStatusCodes = [500, 502, 503, 504, 429]
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx except 429 rate limit)
      const statusCode = error?.response?.status;
      if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        throw error;
      }

      // Don't retry on non-retryable status codes
      if (statusCode && !retryableStatusCodes.includes(statusCode)) {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * delay; // Add 0-30% jitter
      const totalDelay = delay + jitter;

      console.warn(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(totalDelay)}ms. Error: ${
          error?.message || 'Unknown'
        }`
      );

      await sleep(totalDelay);
    }
  }

  throw lastError;
};

export default retryWithBackoff;
