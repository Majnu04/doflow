/**
 * Judge0 Submission Queue
 * Manages concurrent Judge0 API calls with rate limiting and queuing
 */

class Judge0Queue {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  setMaxConcurrent(maxConcurrent = 5) {
    const next = Number(maxConcurrent);
    if (!Number.isFinite(next)) return;
    this.maxConcurrent = Math.max(1, Math.floor(next));
  }

  /**
   * Add a task to the queue
   * @param {Function} task - Async function that returns a promise
   * @returns {Promise} - Resolves with task result or rejects with error
   */
  async enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  /**
   * Process the queue
   */
  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { task, resolve, reject } = this.queue.shift();

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // Process next item in queue
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }

  /**
   * Clear the queue (for testing/maintenance)
   */
  clear() {
    this.queue = [];
  }
}

// Global singleton instance
const defaultMax = Number(process.env.JUDGE0_MAX_CONCURRENT);
const judge0Queue = new Judge0Queue(Number.isFinite(defaultMax) ? Math.max(1, Math.floor(defaultMax)) : 5);

export default judge0Queue;
