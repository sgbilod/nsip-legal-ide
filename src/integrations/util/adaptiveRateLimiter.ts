/**
 * Adaptive Rate Limiter
 * Provides rate limiting for API calls to external services
 */

import { RateLimiter } from '../interfaces';

/**
 * Adaptive Rate Limiter implementation
 * Dynamically adjusts rate limits based on service response times
 */
export class AdaptiveRateLimiter implements RateLimiter {
    // Rate limit tracking
    private limits: Map<string, { count: number, reset: number, limit: number }> = new Map();
    
    // Queue for pending requests
    private queue: Map<string, { fn: () => Promise<any>, resolve: (value: any) => void, reject: (error: any) => void }[]> = new Map();
    
    /**
     * Execute a function with rate limiting
     * @param fn Function to execute
     * @returns Result of the function
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        // In a real implementation, this would use a more sophisticated algorithm
        // to throttle requests based on service response times and rate limits
        
        try {
            return await fn();
        } catch (error) {
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
    async limit(key: string, limit: number, duration: number): Promise<boolean> {
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
    private async processQueue(key: string): Promise<void> {
        const entries = this.queue.get(key);
        
        if (!entries || entries.length === 0) {
            return;
        }
        
        const entry = entries.shift();
        
        if (entry) {
            try {
                const result = await entry.fn();
                entry.resolve(result);
            } catch (error) {
                entry.reject(error);
            }
            
            // Process next item in queue after a delay
            setTimeout(() => this.processQueue(key), 1000);
        }
    }
}
