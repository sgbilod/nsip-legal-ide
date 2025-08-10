/**
 * Document Generator Service
 *
 * Provides document generation capabilities using templates and AI
 */
import { IService, IServiceProvider } from '../core/interfaces';
/**
 * Interface for document generation options
 */
export interface DocumentGenerationOptions {
    templateId: string;
    variables: Record<string, any>;
    format: 'markdown' | 'html' | 'docx' | 'pdf';
    enhanceWithAI: boolean;
    targetJurisdiction?: string;
}
/**
 * Interface for document generation result
 */
export interface DocumentGenerationResult {
    content: string;
    format: string;
    metadata: {
        generatedAt: Date;
        templateId: string;
        wordCount: number;
    };
    warnings?: string[];
}
/**
 * Document generator service that creates documents from templates and data
 */
export declare class DocumentGenerator implements IService {
    private serviceProvider;
    private initialized;
    /**
     * Create a new document generator
     *
     * @param serviceProvider Service provider for dependency injection
     */
    constructor(serviceProvider: IServiceProvider);
    /**
     * Initialize the generator
     */
    initialize(): Promise<void>;
    /**
     * Dispose resources
     */
    dispose(): Promise<void>;
    /**
     * Generate a document from a template and variables
     *
     * @param options Document generation options
     * @returns Generated document
     */
    generateDocument(options: DocumentGenerationOptions): Promise<DocumentGenerationResult>;
    /**
     * Get template content by ID
     *
     * @param templateId Template ID
     * @returns Template content
     */
    private getTemplateContent;
    /**
     * Apply variables to template
     *
     * @param template Template content
     * @param variables Variables to apply
     * @returns Content with variables applied
     */
    private applyVariables;
    /**
     * Enhance document content with AI
     *
     * @param content Document content
     * @param options Generation options
     * @returns Enhanced content
     */
    private enhanceWithAI;
    /**
     * Convert content to requested format
     *
     * @param content Document content
     * @param format Target format
     * @returns Converted content
     */
    private convertFormat;
    /**
     * Count words in text
     *
     * @param text Text to count words in
     * @returns Word count
     */
    private countWords;
}
