import { IService } from '../core/serviceRegistry';
/**
 * Template Engine - Provides template loading, rendering, and validation
 */
export declare class TemplateEngine implements IService {
    private templates;
    private compiledTemplates;
    private ajv;
    private templateBasePath;
    constructor();
    /**
     * Initialize the template engine
     */
    initialize(): Promise<void>;
    /**
     * Register custom handlebars helpers
     */
    private registerHelpers;
    /**
     * Load all templates from the template directory
     */
    private loadAllTemplates;
    /**
     * Get all directories in a path
     * @param dirPath Directory path
     * @returns Array of directory names
     */
    private getDirectories;
    /**
     * Get all files in a path with a specific extension
     * @param dirPath Directory path
     * @param extension File extension
     * @returns Array of file names
     */
    private getFiles;
    /**
     * Load a template from a file
     * @param templateId Template ID
     * @param templatePath Path to template file
     */
    private loadTemplate;
    /**
     * Get all template IDs
     * @returns Array of template IDs
     */
    getTemplateIds(): string[];
    /**
     * Get template by ID
     * @param templateId Template ID
     * @returns Template object
     */
    getTemplate(templateId: string): Template | undefined;
    /**
     * Get all templates
     * @returns Array of all templates
     */
    getAllTemplates(): Template[];
    /**
     * Validate context against template schema
     * @param templateId Template ID
     * @param context Context object
     * @returns Validation result
     */
    validateContext(templateId: string, context: any): ValidationResult;
    /**
     * Render a template with context
     * @param templateId Template ID
     * @param context Context object
     * @returns Rendered template
     */
    renderTemplate(templateId: string, context: any): string;
    /**
     * Create a new template
     * @param category Template category
     * @param name Template name
     * @param content Template content
     * @param schema Template schema (optional)
     * @returns Template ID
     */
    createTemplate(category: string, name: string, content: string, schema?: any): Promise<string>;
    /**
     * Update an existing template
     * @param templateId Template ID
     * @param content New template content
     * @param schema New template schema (optional)
     */
    updateTemplate(templateId: string, content: string, schema?: any): Promise<void>;
    /**
     * Delete a template
     * @param templateId Template ID
     */
    deleteTemplate(templateId: string): Promise<void>;
    /**
     * Dispose the template engine
     */
    dispose(): void;
}
/**
 * Template interface
 */
export interface Template {
    id: string;
    path: string;
    schema: any;
    content: string;
}
/**
 * Validation result interface
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
/**
 * Validation error interface
 */
export interface ValidationError {
    message: string;
    path: string;
    params: any;
}
/**
 * Validation error class
 */
export declare class ValidationError extends Error {
    errors: ValidationError[];
    constructor(message: string, errors: ValidationError[]);
}
