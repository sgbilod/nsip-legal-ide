import { IService, IEventEmitter } from '../core/interfaces';
import * as vscode from 'vscode';

/**
 * Document status
 */
export enum DocumentStatus {
    Draft = 'draft',
    InReview = 'in-review',
    Approved = 'approved',
    Rejected = 'rejected'
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
export class LegalDocumentManager implements IService {
    private eventBus: IEventEmitter;
    private documents: Map<string, LegalDocumentMetadata>;
    
    constructor(eventBus: IEventEmitter) {
        this.eventBus = eventBus;
        this.documents = new Map();
    }
    
    async initialize(): Promise<void> {
        // Subscribe to document events
        this.eventBus.on('document.created', this.handleDocumentCreated.bind(this));
        this.eventBus.on('document.modified', this.handleDocumentModified.bind(this));
        this.eventBus.on('document.statusChanged', this.handleStatusChanged.bind(this));
    }
    
    async dispose(): Promise<void> {
        // Clear documents
        this.documents.clear();
    }
    
    /**
     * Create a new legal document
     */
    async createDocument(template: string): Promise<LegalDocumentMetadata> {
        const document = await this.generateDocument(template);
        this.documents.set(document.id, document);
        this.eventBus.emit('document.created', document);
        return document;
    }
    
    /**
     * Update document status
     */
    async updateStatus(id: string, status: DocumentStatus): Promise<void> {
        const document = this.documents.get(id);
        if (!document) {
            throw new Error(`Document ${id} not found`);
        }
        
        document.status = status;
        document.modifiedAt = new Date().toISOString();
        
        this.eventBus.emit('document.statusChanged', {
            documentId: id,
            oldStatus: document.status,
            newStatus: status
        });
    }
    
    /**
     * Get document metadata
     */
    getDocument(id: string): LegalDocumentMetadata | undefined {
        return this.documents.get(id);
    }
    
    /**
     * List all documents
     */
    listDocuments(): LegalDocumentMetadata[] {
        return Array.from(this.documents.values());
    }
    
    /**
     * Search documents by criteria
     */
    searchDocuments(criteria: Partial<LegalDocumentMetadata>): LegalDocumentMetadata[] {
        return Array.from(this.documents.values()).filter(doc => {
            return Object.entries(criteria).every(([key, value]) => {
                return doc[key as keyof LegalDocumentMetadata] === value;
            });
        });
    }
    
    private async generateDocument(template: string): Promise<LegalDocumentMetadata> {
        // Generate a unique ID
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        
        return {
            id,
            title: `New Document ${id}`,
            type: template,
            status: DocumentStatus.Draft,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            author: await this.getCurrentUser(),
            version: '1.0.0',
            tags: []
        };
    }
    
    private async getCurrentUser(): Promise<string> {
        // In a real implementation, this would get the current user
        // For now, return a placeholder
        return 'current.user@example.com';
    }
    
    private handleDocumentCreated(document: LegalDocumentMetadata): void {
        // Show notification
        vscode.window.showInformationMessage(
            `Created new document: ${document.title}`
        );
    }
    
    private handleDocumentModified(data: { documentId: string }): void {
        const document = this.documents.get(data.documentId);
        if (document) {
            document.modifiedAt = new Date().toISOString();
        }
    }
    
    private handleStatusChanged(data: { 
        documentId: string; 
        oldStatus: DocumentStatus; 
        newStatus: DocumentStatus; 
    }): void {
        vscode.window.showInformationMessage(
            `Document ${data.documentId} status changed from ${data.oldStatus} to ${data.newStatus}`
        );
    }
}
