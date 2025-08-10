import * as vscode from 'vscode';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { IService } from '../core/interfaces';
import Ajv, { JSONSchemaType } from 'ajv';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

/**
 * Template Engine - Provides template loading, rendering, and validation
 */
export class TemplateEngine implements IService {
    private templates: Map<string, Template> = new Map();
    private compiledTemplates: Map<string, handlebars.TemplateDelegate> = new Map();
    private ajv: Ajv;
    private templateBasePath: string = '';
    
    constructor() {
        this.ajv = new Ajv({
            allErrors: true,
            verbose: true,
            strict: false
        });
        
        // Register custom handlebars helpers
        this.registerHelpers();
    }
    
    /**
     * Initialize the template engine
     */
    async initialize(): Promise<void> {
        // Get template path from configuration
        const config = vscode.workspace.getConfiguration('nsip');
        this.templateBasePath = config.get<string>('templates.repository', './templates');
        
        // Make the template path absolute
        if (!path.isAbsolute(this.templateBasePath)) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                this.templateBasePath = path.join(
                    workspaceFolders[0].uri.fsPath,
                    this.templateBasePath
                );
            } else {
                throw new Error('No workspace folder available for template path');
            }
        }
        
        // Create template directory if it doesn't exist
        try {
            await mkdir(this.templateBasePath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
        
        // Load all templates
        await this.loadAllTemplates();
    }
    
    /**
     * Register custom handlebars helpers
     */
    private registerHelpers(): void {
        // Comparison helpers
        handlebars.registerHelper('eq', (a, b) => a === b);
        handlebars.registerHelper('ne', (a, b) => a !== b);
        handlebars.registerHelper('lt', (a, b) => a < b);
        handlebars.registerHelper('gt', (a, b) => a > b);
        handlebars.registerHelper('lte', (a, b) => a <= b);
        handlebars.registerHelper('gte', (a, b) => a >= b);
        
        // Logical helpers
        handlebars.registerHelper('and', (...args) => {
            args.pop(); // Remove options object
            return args.every(Boolean);
        });
        
        handlebars.registerHelper('or', (...args) => {
            args.pop(); // Remove options object
            return args.some(Boolean);
        });
        
        handlebars.registerHelper('not', (value) => !value);
        
        // Formatting helpers
        handlebars.registerHelper('uppercase', (value) => 
            typeof value === 'string' ? value.toUpperCase() : value
        );
        
        handlebars.registerHelper('lowercase', (value) => 
            typeof value === 'string' ? value.toLowerCase() : value
        );
        
        handlebars.registerHelper('capitalize', (value) => {
            if (typeof value !== 'string') return value;
            return value.charAt(0).toUpperCase() + value.slice(1);
        });
        
        handlebars.registerHelper('date', (format) => {
            const date = new Date();
            // Simple formatting - can be extended for more complex formats
            return date.toLocaleDateString();
        });
        
        // Legal document helpers
        handlebars.registerHelper('section', (number, title, options) => {
            return `Section ${number}. ${title}`;
        });
        
        handlebars.registerHelper('clause', (options) => {
            return options.fn(this);
        });
    }
    
    /**
     * Load all templates from the template directory
     */
    private async loadAllTemplates(): Promise<void> {
        try {
            const categories = await this.getDirectories(this.templateBasePath);
            
            for (const category of categories) {
                const categoryPath = path.join(this.templateBasePath, category);
                const templates = await this.getFiles(categoryPath, '.hbs');
                
                for (const templateFile of templates) {
                    const templatePath = path.join(categoryPath, templateFile);
                    const templateId = `${category}/${path.parse(templateFile).name}`;
                    
                    try {
                        await this.loadTemplate(templateId, templatePath);
                    } catch (error) {
                        console.error(`Failed to load template ${templateId}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
            throw error;
        }
    }
    
    /**
     * Get all directories in a path
     * @param dirPath Directory path
     * @returns Array of directory names
     */
    private async getDirectories(dirPath: string): Promise<string[]> {
        const entries = await readdir(dirPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    }
    
    /**
     * Get all files in a path with a specific extension
     * @param dirPath Directory path
     * @param extension File extension
     * @returns Array of file names
     */
    private async getFiles(dirPath: string, extension: string): Promise<string[]> {
        const entries = await readdir(dirPath, { withFileTypes: true });
        return entries
            .filter(entry => entry.isFile() && path.extname(entry.name) === extension)
            .map(entry => entry.name);
    }
    
    /**
     * Load a template from a file
     * @param templateId Template ID
     * @param templatePath Path to template file
     */
    private async loadTemplate(templateId: string, templatePath: string): Promise<void> {
        // Read template file
        const templateContent = await readFile(templatePath, 'utf8');
        
        // Check for schema file
        const schemaPath = templatePath.replace('.hbs', '.schema.json');
        let schema = null;
        
        try {
            if (fs.existsSync(schemaPath)) {
                const schemaContent = await readFile(schemaPath, 'utf8');
                schema = JSON.parse(schemaContent);
            }
        } catch (error) {
            console.error(`Failed to load schema for template ${templateId}:`, error);
        }
        
        // Compile template
        const compiled = handlebars.compile(templateContent);
        
        // Store template
        const template: Template = {
            id: templateId,
            path: templatePath,
            schema: schema,
            content: templateContent
        };
        
        this.templates.set(templateId, template);
        this.compiledTemplates.set(templateId, compiled);
    }
    
    /**
     * Get all template IDs
     * @returns Array of template IDs
     */
    getTemplateIds(): string[] {
        return Array.from(this.templates.keys());
    }
    
    /**
     * Get template by ID
     * @param templateId Template ID
     * @returns Template object
     */
    getTemplate(templateId: string): Template | undefined {
        return this.templates.get(templateId);
    }
    
    /**
     * Get all templates
     * @returns Array of all templates
     */
    getAllTemplates(): Template[] {
        return Array.from(this.templates.values());
    }
    
    /**
     * Validate context against template schema
     * @param templateId Template ID
     * @param context Context object
     * @returns Validation result
     */
    validateContext(templateId: string, context: any): ValidationResult {
        const template = this.templates.get(templateId);
        
        if (!template) {
            return {
                valid: false,
                errors: [{
                    message: `Template ${templateId} not found`,
                    path: '',
                    params: {}
                }]
            };
        }
        
        if (!template.schema) {
            return { valid: true, errors: [] };
        }
        
        const validate = this.ajv.compile(template.schema);
        const valid = validate(context);
        
        if (valid) {
            return { valid: true, errors: [] };
        }
        
        return {
            valid: false,
            errors: validate.errors?.map(error => ({
                message: error.message ?? 'Unknown error',
                path: error.instancePath,
                params: error.params
            })) ?? []
        };
    }
    
    /**
     * Render a template with context
     * @param templateId Template ID
     * @param context Context object
     * @returns Rendered template
     */
    renderTemplate(templateId: string, context: any): string {
        const compiled = this.compiledTemplates.get(templateId);
        
        if (!compiled) {
            throw new Error(`Template ${templateId} not found`);
        }
        
        // Validate context if schema exists
        const validationResult = this.validateContext(templateId, context);
        if (!validationResult.valid) {
            throw new ValidationError(
                `Invalid context for template ${templateId}`,
                validationResult.errors
            );
        }
        
        // Render template
        return compiled(context);
    }
    
    /**
     * Create a new template
     * @param category Template category
     * @param name Template name
     * @param content Template content
     * @param schema Template schema (optional)
     * @returns Template ID
     */
    async createTemplate(
        category: string,
        name: string,
        content: string,
        schema?: any
    ): Promise<string> {
        // Create category directory if it doesn't exist
        const categoryPath = path.join(this.templateBasePath, category);
        await mkdir(categoryPath, { recursive: true });
        
        // Create template file
        const templatePath = path.join(categoryPath, `${name}.hbs`);
        await writeFile(templatePath, content, 'utf8');
        
        // Create schema file if provided
        if (schema) {
            const schemaPath = path.join(categoryPath, `${name}.schema.json`);
            await writeFile(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
        }
        
        // Load template
        const templateId = `${category}/${name}`;
        await this.loadTemplate(templateId, templatePath);
        
        return templateId;
    }
    
    /**
     * Update an existing template
     * @param templateId Template ID
     * @param content New template content
     * @param schema New template schema (optional)
     */
    async updateTemplate(templateId: string, content: string, schema?: any): Promise<void> {
        const template = this.templates.get(templateId);
        
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        
        // Update template file
        await writeFile(template.path, content, 'utf8');
        
        // Update schema file if provided
        if (schema) {
            const schemaPath = template.path.replace('.hbs', '.schema.json');
            await writeFile(schemaPath, JSON.stringify(schema, null, 2), 'utf8');
        }
        
        // Reload template
        await this.loadTemplate(templateId, template.path);
    }
    
    /**
     * Delete a template
     * @param templateId Template ID
     */
    async deleteTemplate(templateId: string): Promise<void> {
        const template = this.templates.get(templateId);
        
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        
        // Delete template file
        await promisify(fs.unlink)(template.path);
        
        // Delete schema file if it exists
        const schemaPath = template.path.replace('.hbs', '.schema.json');
        if (fs.existsSync(schemaPath)) {
            await promisify(fs.unlink)(schemaPath);
        }
        
        // Remove from maps
        this.templates.delete(templateId);
        this.compiledTemplates.delete(templateId);
    }
    
    /**
     * Dispose the template engine
     */
    dispose(): void {
        this.templates.clear();
        this.compiledTemplates.clear();
    }
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
export class ValidationError extends Error {
    constructor(message: string, public errors: ValidationError[]) {
        super(message);
        this.name = 'ValidationError';
    }
}
