import { IService, IEventEmitter } from '../core/interfaces';
/**
 * Document status
 */
export declare enum DocumentStatus {
    Draft = "draft",
    InReview = "in-review",
    Approved = "approved",
    Rejected = "rejected"
}
/**
 * Legal document metadata
 */
export interface LegalDocumentMetadata {
    id: string;
    title: string;
    type: string;
    status: DocumentStatus;
    createdAt: string;
    modifiedAt: string;
    author: string;
    version: string;
    tags: string[];
    jurisdiction?: string;
    relatedDocuments?: string[];
}
/**
 * Service for managing legal documents
 */
export declare class LegalDocumentManager implements IService {
    private eventBus;
    private documents;
    constructor(eventBus: IEventEmitter);
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    /**
     * Create a new legal document
     */
    createDocument(template: string): Promise<LegalDocumentMetadata>;
    /**
     * Update document status
     */
    updateStatus(id: string, status: DocumentStatus): Promise<void>;
    /**
     * Get document metadata
     */
    getDocument(id: string): LegalDocumentMetadata | undefined;
    /**
     * List all documents
     */
    listDocuments(): LegalDocumentMetadata[];
    /**
     * Search documents by criteria
     */
    searchDocuments(criteria: Partial<LegalDocumentMetadata>): LegalDocumentMetadata[];
    private generateDocument;
    private getCurrentUser;
    private handleDocumentCreated;
    private handleDocumentModified;
    private handleStatusChanged;
}
