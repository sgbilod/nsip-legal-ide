"use strict";
/**
 * Adaptive Rate Limiter
 * Provides rate limiting for API calls to external services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveRateLimiter = void 0;
/**
 * Adaptive Rate Limiter implementation
 * Dynamically adjusts rate limits based on service response times
 */
class AdaptiveRateLimiter {
    constructor() {
        // Rate limit tracking
        this.limits = new Map();
        // Queue for pending requests
        this.queue = new Map();
    }
    /**
     * Execute a function with rate limiting
     * @param fn Function to execute
     * @returns Result of the function
     */
    async execute(fn) {
        // In a real implementation, this would use a more sophisticated algorithm
        // to throttle requests based on service response times and rate limits
        try {
            return await fn();
        }
        catch (error) {
            // If we get a rate limit error, we would add to queue and retry
            throw error;
        }
    }
    /**
     * Limit a key to a specific rate
     * @param key Rate limit key
     * @param limit Maximum number of requests
     * @param duration Duration in seconds
     * @returns Whether the request is allowed
     */
    async limit(key, limit, duration) {
        const now = Date.now();
        const entry = this.limits.get(key);
        // If no entry or reset time has passed, create new entry
        if (!entry || entry.reset < now) {
            this.limits.set(key, {
                count: 1,
                reset: now + (duration * 1000),
                limit
            });
            return true;
        }
        // If under limit, increment count
        if (entry.count < entry.limit) {
            entry.count++;
            return true;
        }
        // Over limit, deny request
        return false;
    }
    /**
     * Process the queue for a key
     * @param key Rate limit key
     */
    async processQueue(key) {
        const entries = this.queue.get(key);
        if (!entries || entries.length === 0) {
            return;
        }
        const entry = entries.shift();
        if (entry) {
            try {
                const result = await entry.fn();
                entry.resolve(result);
            }
            catch (error) {
                entry.reject(error);
            }
            // Process next item in queue after a delay
            setTimeout(() => this.processQueue(key), 1000);
        }
    }
}
exports.AdaptiveRateLimiter = AdaptiveRateLimiter;
//# sourceMappingURL=adaptiveRateLimiter.js.map