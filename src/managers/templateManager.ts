import * as vscode from 'vscode';
import * as path from 'path';
import { IService } from '../core/serviceRegistry';
import { TemplateEngine, Template } from '../templates/templateEngine';
import { ServiceRegistry } from '../core/serviceRegistry';
import { Logger } from '../core/logger';

/**
 * Template Manager - Manages templates and template-based document creation
 */
export class TemplateManager implements IService {
    private logger: Logger;
    
    /**
     * Create a new template manager
     * @param context Extension context
     * @param templateEngine Template engine
     */
    constructor(
        private context: vscode.ExtensionContext,
        private templateEngine: TemplateEngine
    ) {
        this.logger = ServiceRegistry.getInstance().get<Logger>('logger');
    }
    
    /**
     * Initialize the template manager
     */
    async initialize(): Promise<void> {
        this.logger.info('Template manager initialized');
    }
    
    /**
     * Get all template categories
     * @returns Array of template categories
     */
    async getTemplateCategories(): Promise<string[]> {
        const templateIds = this.templateEngine.getTemplateIds();
        const categories = new Set<string>();
        
        for (const templateId of templateIds) {
            const category = templateId.split('/')[0];
            categories.add(category);
        }
        
        return Array.from(categories);
    }
    
    /**
     * Get templates by category
     * @param category Template category
     * @returns Array of templates in the category
     */
    async getTemplatesByCategory(category: string): Promise<Template[]> {
        const allTemplates = this.templateEngine.getAllTemplates();
        return allTemplates.filter(template => template.id.startsWith(`${category}/`));
    }
    
    /**
     * Get all templates
     * @returns Array of all templates
     */
    async getAllTemplates(): Promise<Template[]> {
        return this.templateEngine.getAllTemplates();
    }
    
    /**
     * Create a document from a template
     * @param templateName Template name
     * @returns The created document
     */
    async createDocumentFromTemplate(templateName: string): Promise<vscode.TextDocument> {
        // Find template
        const allTemplates = this.templateEngine.getAllTemplates();
        const template = allTemplates.find(t => {
            const parts = t.id.split('/');
            return parts[parts.length - 1] === templateName;
        });
        
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }
        
        // Get template context
        const context = await this.getTemplateContext(template);
        
        // Render template
        const renderedContent = this.templateEngine.renderTemplate(template.id, context);
        
        // Create untitled document
        const document = await vscode.workspace.openTextDocument({
            content: renderedContent,
            language: 'markdown'
        });
        
        // Show document
        await vscode.window.showTextDocument(document);
        
        return document;
    }
    
    /**
     * Get context for a template through user input
     * @param template Template
     * @returns Template context
     */
    private async getTemplateContext(template: Template): Promise<any> {
        if (!template.schema) {
            return {}; // No schema, no context needed
        }
        
        const context: any = {};
        
        // Extract required properties from schema
        const requiredProps = template.schema.required || [];
        const properties = template.schema.properties || {};
        
        // Get input for each required property
        for (const propName of requiredProps) {
            const propSchema = properties[propName];
            if (!propSchema) continue;
            
            const title = propSchema.title || propName;
            const description = propSchema.description || '';
            
            if (propSchema.type === 'boolean') {
                const result = await vscode.window.showQuickPick(
                    ['Yes', 'No'],
                    {
                        placeHolder: title,
                        title: description
                    }
                );
                
                context[propName] = result === 'Yes';
            } else if (propSchema.enum) {
                const result = await vscode.window.showQuickPick(
                    propSchema.enum.map(String),
                    {
                        placeHolder: title,
                        title: description
                    }
                );
                
                context[propName] = result;
            } else {
                const result = await vscode.window.showInputBox({
                    prompt: title,
                    placeHolder: description
                });
                
                // Convert to appropriate type
                if (propSchema.type === 'number' || propSchema.type === 'integer') {
                    context[propName] = Number(result);
                } else {
                    context[propName] = result;
                }
            }
        }
        
        return context;
    }
    
    /**
     * Open a template for customization
     * @param templateName Template name
     */
    async openTemplateForCustomization(templateName: string): Promise<void> {
        // Find template
        const allTemplates = this.templateEngine.getAllTemplates();
        const template = allTemplates.find(t => {
            const parts = t.id.split('/');
            return parts[parts.length - 1] === templateName;
        });
        
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }
        
        // Open template file
        const templateUri = vscode.Uri.file(template.path);
        const document = await vscode.workspace.openTextDocument(templateUri);
        await vscode.window.showTextDocument(document);
        
        // Check for schema file
        const schemaPath = template.path.replace('.hbs', '.schema.json');
        const schemaUri = vscode.Uri.file(schemaPath);
        
        try {
            const stat = await vscode.workspace.fs.stat(schemaUri);
            if (stat) {
                // Open schema file in split editor
                const schemaDocument = await vscode.workspace.openTextDocument(schemaUri);
                await vscode.window.showTextDocument(schemaDocument, {
                    viewColumn: vscode.ViewColumn.Beside
                });
            }
        } catch {
            // Schema file doesn't exist
        }
    }
    
    /**
     * Dispose the template manager
     */
    dispose(): void {
        // No resources to dispose
    }
}
