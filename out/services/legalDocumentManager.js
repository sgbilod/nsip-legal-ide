"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegalDocumentManager = exports.DocumentStatus = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Document status
 */
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["Draft"] = "draft";
    DocumentStatus["InReview"] = "in-review";
    DocumentStatus["Approved"] = "approved";
    DocumentStatus["Rejected"] = "rejected";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
/**
 * Service for managing legal documents
 */
class LegalDocumentManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.documents = new Map();
    }
    async initialize() {
        // Subscribe to document events
        this.eventBus.on('document.created', this.handleDocumentCreated.bind(this));
        this.eventBus.on('document.modified', this.handleDocumentModified.bind(this));
        this.eventBus.on('document.statusChanged', this.handleStatusChanged.bind(this));
    }
    async dispose() {
        // Clear documents
        this.documents.clear();
    }
    /**
     * Create a new legal document
     */
    async createDocument(template) {
        const document = await this.generateDocument(template);
        this.documents.set(document.id, document);
        this.eventBus.emit('document.created', document);
        return document;
    }
    /**
     * Update document status
     */
    async updateStatus(id, status) {
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
    getDocument(id) {
        return this.documents.get(id);
    }
    /**
     * List all documents
     */
    listDocuments() {
        return Array.from(this.documents.values());
    }
    /**
     * Search documents by criteria
     */
    searchDocuments(criteria) {
        return Array.from(this.documents.values()).filter(doc => {
            return Object.entries(criteria).every(([key, value]) => {
                return doc[key] === value;
            });
        });
    }
    async generateDocument(template) {
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
    async getCurrentUser() {
        // In a real implementation, this would get the current user
        // For now, return a placeholder
        return 'current.user@example.com';
    }
    handleDocumentCreated(document) {
        // Show notification
        vscode.window.showInformationMessage(`Created new document: ${document.title}`);
    }
    handleDocumentModified(data) {
        const document = this.documents.get(data.documentId);
        if (document) {
            document.modifiedAt = new Date().toISOString();
        }
    }
    handleStatusChanged(data) {
        vscode.window.showInformationMessage(`Document ${data.documentId} status changed from ${data.oldStatus} to ${data.newStatus}`);
    }
}
exports.LegalDocumentManager = LegalDocumentManager;
//# sourceMappingURL=legalDocumentManager.js.map