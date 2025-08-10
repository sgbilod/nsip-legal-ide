"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiLevelCache = void 0;
const types_1 = require("./types");
/**
 * Circuit breaker implementation for cache layer resilience
 */
class CircuitBreaker {
    constructor(threshold) {
        this.state = types_1.CircuitState.Closed;
        this.failures = 0;
        this.lastFailure = 0;
        this.threshold = threshold;
    }
    async execute(operation) {
        if (this.state === types_1.CircuitState.Open) {
            if (Date.now() - this.lastFailure >= this.threshold.resetTimeout) {
                this.state = types_1.CircuitState.HalfOpen;
            }
            else {
                throw new Error('Circuit breaker is open');
            }
        }
        try {
            const result = await operation();
            if (this.state === types_1.CircuitState.HalfOpen) {
                this.state = types_1.CircuitState.Closed;
                this.failures = 0;
            }
            return result;
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    recordFailure() {
        this.failures++;
        this.lastFailure = Date.now();
        if (this.failures >= this.threshold.failures) {
            this.state = types_1.CircuitState.Open;
            this.failures = 0;
        }
    }
}
/**
 * In-memory cache implementation
 */
class InMemoryCache {
    constructor(options) {
        this.cache = new Map();
        this.maxSize = this.parseSize(options.size);
        this.stats = {
            hits: 0,
            misses: 0,
            size: 0,
            items: 0,
            avgAccessTime: 0
        };
    }
    async get(key) {
        const start = Date.now();
        const item = this.cache.get(key);
        if (!item || (item.expires && item.expires < Date.now())) {
            this.stats.misses++;
            if (item) {
                this.cache.delete(key);
            }
            return null;
        }
        this.stats.hits++;
        this.stats.avgAccessTime =
            (this.stats.avgAccessTime * (this.stats.hits - 1) + (Date.now() - start)) /
                this.stats.hits;
        return item.value;
    }
    async set(key, value, options = {}) {
        const size = Buffer.byteLength(JSON.stringify(value));
        if (this.stats.size + size > this.maxSize) {
            await this.evict(size);
        }
        const expires = options.ttl ? Date.now() + options.ttl * 1000 : undefined;
        this.cache.set(key, { value, expires });
        this.stats.size += size;
        this.stats.items = this.cache.size;
    }
    async delete(key) {
        const item = this.cache.get(key);
        if (item) {
            const size = Buffer.byteLength(JSON.stringify(item.value));
            this.stats.size -= size;
            this.stats.items--;
        }
        this.cache.delete(key);
    }
    async clear() {
        this.cache.clear();
        this.stats.size = 0;
        this.stats.items = 0;
    }
    async getStats() {
        return { ...this.stats };
    }
    parseSize(size) {
        const units = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
        const match = size.match(/^(\d+)(KB|MB|GB)$/);
        if (!match) {
            throw new Error('Invalid size format');
        }
        return parseInt(match[1]) * units[match[2]];
    }
    async evict(requiredSize) {
        // LRU eviction strategy
        const entries = Array.from(this.cache.entries())
            .sort((a, b) => {
            const aExpires = a[1].expires || Infinity;
            const bExpires = b[1].expires || Infinity;
            return aExpires - bExpires;
        });
        let freedSize = 0;
        for (const [key, item] of entries) {
            if (freedSize >= requiredSize)
                break;
            const size = Buffer.byteLength(JSON.stringify(item.value));
            await this.delete(key);
            freedSize += size;
        }
    }
}
/**
 * Multi-level caching service
 */
class MultiLevelCache {
    constructor() {
        this.layers = new Map();
        this.placementStrategy = new CachePlacementStrategy();
    }
    async initialize() {
        // Initialize cache layers
        this.layers.set('l1', {
            cache: new InMemoryCache({ size: '1GB' }),
            breaker: new CircuitBreaker({
                failures: 3,
                timeWindow: 10000,
                resetTimeout: 30000
            })
        });
        // Additional layers would be initialized here
        // Redis, CDN, etc.
    }
    async dispose() {
        for (const layer of this.layers.values()) {
            await layer.cache.clear();
        }
    }
    async get(key) {
        for (const [level, { cache, breaker }] of this.layers) {
            try {
                const result = await breaker.execute(() => cache.get(key));
                if (result) {
                    await this.promote(key, result, level);
                    return result;
                }
            }
            catch (error) {
                console.error(`Cache layer ${level} error:`, error);
                continue;
            }
        }
        return null;
    }
    async set(key, value, options = {}) {
        const placement = await this.placementStrategy.determine({
            size: Buffer.byteLength(JSON.stringify(value)),
            accessFrequency: await this.getAccessFrequency(key),
            importance: options.importance || 'normal',
            geography: await this.getGeographicDemand(key)
        });
        await Promise.all(placement.layers.map(layer => {
            const { cache, breaker } = this.layers.get(layer);
            return breaker.execute(() => cache.set(key, value, {
                ...options,
                ttl: placement.ttl,
                compress: placement.compress
            }));
        }));
    }
    async promote(key, value, fromLevel) {
        const levels = Array.from(this.layers.keys());
        const currentIndex = levels.indexOf(fromLevel);
        if (currentIndex > 0) {
            const targetLevel = levels[currentIndex - 1];
            const { cache, breaker } = this.layers.get(targetLevel);
            await breaker.execute(() => cache.set(key, value, { ttl: 300 }) // 5 minutes promotion TTL
            );
        }
    }
    async getAccessFrequency(key) {
        // Implement access frequency tracking
        // This would typically use a time-series database
        return 1;
    }
    async getGeographicDemand(key) {
        // Implement geographic demand analysis
        // This would typically use real-time analytics
        return ['us-east'];
    }
}
exports.MultiLevelCache = MultiLevelCache;
/**
 * Cache placement strategy
 */
class CachePlacementStrategy {
    async determine(analysis) {
        // Implement intelligent cache placement strategy
        return {
            layers: ['l1'],
            ttl: 3600,
            compress: false,
            replicate: false
        };
    }
}
//# sourceMappingURL=cachingStrategy.js.map