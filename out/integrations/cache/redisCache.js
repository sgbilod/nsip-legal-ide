"use strict";
/**
 * Redis Cache Implementation
 * Provides distributed caching for the Legal API Gateway
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
/**
 * Redis Cache implementation
 * In a real implementation, this would use a Redis client
 */
class RedisCache {
    constructor() {
        // In-memory cache for this example
        this.cache = new Map();
    }
    /**
     * Get a value from the cache
     * @param key Cache key
     * @returns The cached value or null if not found
     */
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Check if expired
        if (entry.expires && entry.expires < Date.now()) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to cache
     * @param options Cache options
     */
    async set(key, value, options) {
        const expires = options?.ttl ? Date.now() + (options.ttl * 1000) : undefined;
        this.cache.set(key, {
            value,
            expires
        });
    }
    /**
     * Delete a value from the cache
     * @param key Cache key
     * @returns True if the key was deleted
     */
    async delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Clear the entire cache
     */
    async clear() {
        this.cache.clear();
    }
}
exports.RedisCache = RedisCache;
//# sourceMappingURL=redisCache.js.map