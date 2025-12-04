/**
 * Simple client-side rate limiter for API calls
 * Prevents duplicate/rapid requests to the same endpoint
 */

class RateLimiter {
  constructor(maxRequests = 5, timeWindowMs = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindowMs = timeWindowMs;
    this.requests = new Map(); // endpoint -> array of timestamps
  }

  /**
   * Check if a request is allowed
   * @param {string} key - unique identifier (e.g., endpoint path)
   * @returns {boolean} - true if request is allowed, false if rate limited
   */
  isAllowed(key) {
    const now = Date.now();
    const requestTimes = this.requests.get(key) || [];

    // Remove old requests outside the time window
    const recentRequests = requestTimes.filter(
      (time) => now - time < this.timeWindowMs
    );

    if (recentRequests.length < this.maxRequests) {
      recentRequests.push(now);
      this.requests.set(key, recentRequests);
      return true;
    }

    return false;
  }

  /**
   * Reset rate limiter for a key
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Reset all rate limiters
   */
  resetAll() {
    this.requests.clear();
  }
}

// Export singleton instance
export const apiRateLimiter = new RateLimiter(10, 1000); // 10 requests per second
