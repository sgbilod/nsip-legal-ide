/**
 * Adaptive Rate Limiter
 * Provides rate limiting for API calls to external services
 */
import { RateLimiter } from '../interfaces';
/**
 * Adaptive Rate Limiter implementation
 * Dynamically adjusts rate limits based on service response times
 */
export declare class AdaptiveRateLimiter implements RateLimiter {
    private limits;
    private queue;
    /**
     * Execute a function with rate limiting
     * @param fn Function to execute
     * @returns Result of the function
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Limit a key to a specific rate
     * @param key Rate limit key
     * @param limit Maximum number of requests
     * @param duration Duration in seconds
     * @returns Whether the request is allowed
     */
    limit(key: string, limit: number, duration: number): Promise<boolean>;
    /**
     * Process the queue for a key
     * @param key Rate limit key
     */
    private processQueue;
}
