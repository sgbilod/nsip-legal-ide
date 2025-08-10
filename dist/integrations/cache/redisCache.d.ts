/**
 * Redis Cache Implementation
 * Provides distributed caching for the Legal API Gateway
 */
import { DistributedCache } from '../interfaces';
/**
 * Redis Cache implementation
 * In a real implementation, this would use a Redis client
 */
export declare class RedisCache implements DistributedCache {
    private cache;
    /**
     * Get a value from the cache
     * @param key Cache key
     * @returns The cached value or null if not found
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to cache
     * @param options Cache options
     */
    set<T>(key: string, value: T, options?: {
        ttl?: number;
    }): Promise<void>;
    /**
     * Delete a value from the cache
     * @param key Cache key
     * @returns True if the key was deleted
     */
    delete(key: string): Promise<boolean>;
    /**
     * Clear the entire cache
     */
    clear(): Promise<void>;
}
