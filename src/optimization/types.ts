/**
 * Cache options interface
 */
export interface CacheOptions {
    ttl?: number;
    importance?: 'low' | 'normal' | 'high' | 'critical';
    compress?: boolean;
    region?: string;
    consistency?: 'weak' | 'strong';
}

/**
 * Cache analysis result
 */
export interface CacheAnalysis {
    size: number;
    accessFrequency: number;
    importance: string;
    geography: string[];
}

/**
 * Cache placement result
 */
export interface CachePlacement {
    layers: string[];
    ttl: number;
    compress: boolean;
    replicate: boolean;
}

/**
 * Base cache interface
 */
export interface ICache {
    get(key: string): Promise<any>;
    set(key: string, value: any, options?: CacheOptions): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    getStats(): Promise<CacheStats>;
}

/**
 * Cache statistics
 */
export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
    items: number;
    avgAccessTime: number;
}

/**
 * Circuit breaker states
 */
export enum CircuitState {
    Closed = 'closed',
    Open = 'open',
    HalfOpen = 'half-open'
}

/**
 * Error threshold configuration
 */
export interface ErrorThreshold {
    failures: number;
    timeWindow: number;
    resetTimeout: number;
}

/**
 * Geographic demand analysis
 */
export interface GeographicDemand {
    region: string;
    demand: number;
    latency: number;
    lastUpdated: string;
}
