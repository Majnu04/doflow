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
const judge0Queue = new Judge0Queue(5); // Max 5 concurrent Judge0 calls

export default judge0Queue;
