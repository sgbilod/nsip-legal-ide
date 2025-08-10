/**
 * Government Filing Integration
 * Provides a unified interface for filing legal documents with government agencies
 */
import { IService } from '../core/serviceRegistry';
import { LegalDocument, Jurisdiction, FilingType, FilingReceipt } from './interfaces';
/**
 * Government Filing Integration class
 * Manages filing documents with government agencies across jurisdictions
 */
export declare class GovernmentFilingIntegration implements IService {
    private logger;
    private eventBus;
    private trackingService;
    private filingSystems;
    constructor();
    /**
     * Initialize the filing system
     */
    initialize(): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): Promise<void>;
    /**
     * File a document with the appropriate government agency
     * @param document The legal document to file
     * @param jurisdiction The jurisdiction to file with
     * @param filingType The type of filing
     * @returns Filing receipt
     */
    fileDocument(document: LegalDocument, jurisdiction: Jurisdiction, filingType: FilingType): Promise<FilingReceipt>;
    /**
     * Get filing requirements for a jurisdiction and filing type
     * @param jurisdiction The jurisdiction to file with
     * @param filingType The type of filing
     * @returns Filing requirements
     */
    private getFilingRequirements;
    /**
     * Validate a document against filing requirements
     * @param document The document to validate
     * @param requirements The filing requirements
     */
    private validateDocument;
    /**
     * Prepare a filing package for submission
     * @param document The document to file
     * @param requirements The filing requirements
     * @returns The prepared filing package
     */
    private prepareFilingPackage;
    /**
     * Submit a filing to the appropriate system
     * @param filingPackage The prepared filing package
     * @param jurisdiction The jurisdiction to file with
     * @returns Filing receipt
     */
    private submitFiling;
}
