import * as vscode from 'vscode';
import { IService } from '../core/serviceRegistry';
import { TemplateEngine, Template } from '../templates/templateEngine';
/**
 * Template Manager - Manages templates and template-based document creation
 */
export declare class TemplateManager implements IService {
    private context;
    private templateEngine;
    private logger;
    /**
     * Create a new template manager
     * @param context Extension context
     * @param templateEngine Template engine
     */
    constructor(context: vscode.ExtensionContext, templateEngine: TemplateEngine);
    /**
     * Initialize the template manager
     */
    initialize(): Promise<void>;
    /**
     * Get all template categories
     * @returns Array of template categories
     */
    getTemplateCategories(): Promise<string[]>;
    /**
     * Get templates by category
     * @param category Template category
     * @returns Array of templates in the category
     */
    getTemplatesByCategory(category: string): Promise<Template[]>;
    /**
     * Get all templates
     * @returns Array of all templates
     */
    getAllTemplates(): Promise<Template[]>;
    /**
     * Create a document from a template
     * @param templateName Template name
     * @returns The created document
     */
    createDocumentFromTemplate(templateName: string): Promise<vscode.TextDocument>;
    /**
     * Get context for a template through user input
     * @param template Template
     * @returns Template context
     */
    private getTemplateContext;
    /**
     * Open a template for customization
     * @param templateName Template name
     */
    openTemplateForCustomization(templateName: string): Promise<void>;
    /**
     * Dispose the template manager
     */
    dispose(): void;
}
