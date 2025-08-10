/**
 * Universal Legal API Gateway
 * Provides a unified interface for connecting to various legal databases and services
 */

import { EventBus } from '../core/eventBus';
import { ServiceRegistry } from '../core/serviceRegistry';
import { Logger } from '../core/logger';
import { 
    LegalSystemConnector, 
    LegalQuery, 
    CaseLawResults, 
    LegalDocument, 
    LegalSource,
    DistributedCache,
    RateLimiter 
} from './interfaces';
import { IService } from '../core/serviceRegistry';

// Connector imports
import { WestlawConnector } from './connectors/westlawConnector';
import { LexisNexisConnector } from './connectors/lexisNexisConnector';
import { PACERConnector } from './connectors/pacerConnector';
import { CourthouseNewsConnector } from './connectors/courthouseNewsConnector';
import { SECEdgarConnector } from './connectors/secEdgarConnector';
import { USPTOConnector } from './connectors/usptoConnector';

// Cache implementation
import { RedisCache } from './cache/redisCache';

// Rate limiter implementation
import { AdaptiveRateLimiter } from './util/adaptiveRateLimiter';

/**
 * Legal API Gateway class
 * Provides a unified interface for accessing various legal databases and services
 */
export class LegalApiGateway implements IService {
    private connectors: Map<string, LegalSystemConnector> = new Map();
    private cache: DistributedCache;
    private rateLimiter: RateLimiter;
    private logger: Logger;
    private eventBus: EventBus;

    constructor() {
        const serviceRegistry = ServiceRegistry.getInstance();
        this.logger = serviceRegistry.get<Logger>('logger');
        this.eventBus = serviceRegistry.get<EventBus>('eventBus');
        
        // Initialize cache and rate limiter
        this.cache = new RedisCache();
        this.rateLimiter = new AdaptiveRateLimiter();
        
        this.logger.info('LegalApiGateway: Initializing');
    }
    
    /**
     * Dispose of resources
     */
    async dispose(): Promise<void> {
        this.logger.info('LegalApiGateway: Disposing');
        
        // Disconnect all connectors
        for (const connector of this.connectors.values()) {
            try {
                await connector.disconnect();
            } catch (error) {
                this.logger.error(`LegalApiGateway: Error disconnecting ${connector.name}`, error);
            }
        }
        
        // Clear cache
        await this.cache.clear();
        
        // Unsubscribe from events
        this.eventBus.unsubscribe('legal.search.requested', 'legalApiGateway.search');
    }
    
    /**
     * Initialize the gateway
     */
    async initialize(): Promise<void> {
        this.logger.info('LegalApiGateway: Registering connectors');
        
        // Register all available connectors
        await this.registerConnectors([
            new WestlawConnector(),
            new LexisNexisConnector(),
            new PACERConnector(),
            new CourthouseNewsConnector(),
            new SECEdgarConnector(),
            new USPTOConnector()
        ]);
        
        // Subscribe to relevant events
        this.eventBus.subscribe('legal.search.requested', {
            id: 'legalApiGateway.search',
            handle: async (query: LegalQuery) => {
                try {
                    const results = await this.searchCaseLaw(query);
                    this.eventBus.publish('legal.search.completed', { query, results });
                } catch (error) {
                    this.logger.error('LegalApiGateway: Search failed', error);
                    this.eventBus.publish('legal.search.failed', { query, error });
                }
            }
        });
        
        this.logger.info('LegalApiGateway: Initialization complete');
    }
    
    /**
     * Register connectors with the gateway
     * @param connectors Array of legal system connectors
     */
    private async registerConnectors(connectors: LegalSystemConnector[]): Promise<void> {
        for (const connector of connectors) {
            try {
                this.logger.info(`LegalApiGateway: Registering connector ${connector.name}`);
                
                // Initialize and connect the connector
                const connected = await connector.connect();
                
                if (connected) {
                    this.connectors.set(connector.id, connector);
                    this.logger.info(`LegalApiGateway: Successfully registered ${connector.name}`);
                } else {
                    this.logger.warn(`LegalApiGateway: Failed to connect to ${connector.name}`);
                }
            } catch (error) {
                this.logger.error(`LegalApiGateway: Error registering connector ${connector.name}`, error);
            }
        }
    }
    
    /**
     * Search for case law across all registered connectors
     * @param query Legal search query parameters
     * @returns Aggregated search results
     */
    async searchCaseLaw(query: LegalQuery): Promise<CaseLawResults> {
        this.logger.info('LegalApiGateway: Searching case law', { query });
        
        // Generate cache key from query
        const cacheKey = `search:${JSON.stringify(query)}`;
        
        // Check cache first
        const cached = await this.cache.get<CaseLawResults>(cacheKey);
        if (cached) {
            this.logger.info('LegalApiGateway: Returning cached results');
            return cached;
        }
        
        // Search across all connectors with rate limiting
        const results = await Promise.allSettled(
            Array.from(this.connectors.values()).map(connector =>
                this.rateLimiter.execute(() =>
                    connector.searchCases(query)
                )
            )
        );
        
        // Aggregate successful results
        const aggregated = this.aggregateResults(results);
        
        // Cache results for future use
        await this.cache.set(cacheKey, aggregated, { ttl: 3600 });
        
        return aggregated;
    }
    
    /**
     * Fetch a specific legal document from its source
     * @param documentId Unique identifier for the document
     * @param source Source database for the document
     * @returns The requested legal document
     */
    async fetchDocument(documentId: string, source: LegalSource): Promise<LegalDocument> {
        this.logger.info('LegalApiGateway: Fetching document', { documentId, source });
        
        // Check cache first
        const cacheKey = `document:${source}:${documentId}`;
        const cached = await this.cache.get<LegalDocument>(cacheKey);
        if (cached) {
            this.logger.info('LegalApiGateway: Returning cached document');
            return cached;
        }
        
        // Get appropriate connector
        const connector = this.getConnectorForSource(source);
        if (!connector) {
            throw new Error(`No connector available for source ${source}`);
        }
        
        // Fetch document with rate limiting
        const document = await this.rateLimiter.execute(() =>
            connector.fetchDocument(documentId)
        );
        
        // Process and enhance the document
        const processed = await this.processLegalDocument(document);
        
        // Cache the processed document
        await this.cache.set(cacheKey, processed, { ttl: 3600 });
        
        return processed;
    }
    
    /**
     * Aggregate results from multiple connectors
     * @param results Promise results from multiple connectors
     * @returns Aggregated case law results
     */
    private aggregateResults(results: PromiseSettledResult<any>[]): CaseLawResults {
        const successfulResults = results
            .filter((result): result is PromiseFulfilledResult<any> => 
                result.status === 'fulfilled'
            )
            .map(result => result.value);
        
        if (successfulResults.length === 0) {
            this.logger.warn('LegalApiGateway: No successful results from any connector');
            return {
                providers: [],
                totalResults: 0,
                cases: [],
                providerBreakdown: {}
            };
        }
        
        // Combine all cases and remove duplicates
        const allCases = successfulResults.flatMap(result => result.cases);
        const uniqueCases = this.deduplicateCases(allCases);
        
        // Create provider breakdown
        const providerBreakdown: Record<string, number> = {};
        successfulResults.forEach(result => {
            providerBreakdown[result.provider] = result.totalResults;
        });
        
        return {
            providers: successfulResults.map(result => result.provider),
            totalResults: uniqueCases.length,
            cases: uniqueCases,
            providerBreakdown
        };
    }
    
    /**
     * Process and enhance a legal document
     * @param document Raw legal document
     * @returns Processed and enhanced document
     */
    private async processLegalDocument(document: LegalDocument): Promise<LegalDocument> {
        // Implement document processing logic
        // Example: Add citations, extract entities, normalize formatting, etc.
        
        return document;
    }
    
    /**
     * Get connector for a specific legal source
     * @param source Legal source
     * @returns Connector for the specified source
     */
    private getConnectorForSource(source: LegalSource): LegalSystemConnector | undefined {
        // Map source enum to connector ID
        const connectorId = source.toLowerCase();
        return this.connectors.get(connectorId);
    }
    
    /**
     * Remove duplicate cases from results
     * @param cases Array of case law items
     * @returns Array with duplicates removed
     */
    private deduplicateCases(cases: any[]): any[] {
        const seen = new Set();
        return cases.filter(item => {
            const key = item.id || item.citation;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}
