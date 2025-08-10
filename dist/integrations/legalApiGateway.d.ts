/**
 * Universal Legal API Gateway
 * Provides a unified interface for connecting to various legal databases and services
 */
import { LegalQuery, CaseLawResults, LegalDocument, LegalSource } from './interfaces';
import { IService } from '../core/serviceRegistry';
/**
 * Legal API Gateway class
 * Provides a unified interface for accessing various legal databases and services
 */
export declare class LegalApiGateway implements IService {
    private connectors;
    private cache;
    private rateLimiter;
    private logger;
    private eventBus;
    constructor();
    /**
     * Dispose of resources
     */
    dispose(): Promise<void>;
    /**
     * Initialize the gateway
     */
    initialize(): Promise<void>;
    /**
     * Register connectors with the gateway
     * @param connectors Array of legal system connectors
     */
    private registerConnectors;
    /**
     * Search for case law across all registered connectors
     * @param query Legal search query parameters
     * @returns Aggregated search results
     */
    searchCaseLaw(query: LegalQuery): Promise<CaseLawResults>;
    /**
     * Fetch a specific legal document from its source
     * @param documentId Unique identifier for the document
     * @param source Source database for the document
     * @returns The requested legal document
     */
    fetchDocument(documentId: string, source: LegalSource): Promise<LegalDocument>;
    /**
     * Aggregate results from multiple connectors
     * @param results Promise results from multiple connectors
     * @returns Aggregated case law results
     */
    private aggregateResults;
    /**
     * Process and enhance a legal document
     * @param document Raw legal document
     * @returns Processed and enhanced document
     */
    private processLegalDocument;
    /**
     * Get connector for a specific legal source
     * @param source Legal source
     * @returns Connector for the specified source
     */
    private getConnectorForSource;
    /**
     * Remove duplicate cases from results
     * @param cases Array of case law items
     * @returns Array with duplicates removed
     */
    private deduplicateCases;
}
