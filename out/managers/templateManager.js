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
exports.TemplateManager = void 0;
const vscode = __importStar(require("vscode"));
const serviceRegistry_1 = require("../core/serviceRegistry");
/**
 * Template Manager - Manages templates and template-based document creation
 */
class TemplateManager {
    /**
     * Create a new template manager
     * @param context Extension context
     * @param templateEngine Template engine
     */
    constructor(context, templateEngine) {
        this.context = context;
        this.templateEngine = templateEngine;
        this.logger = serviceRegistry_1.ServiceRegistry.getInstance().get('logger');
    }
    /**
     * Initialize the template manager
     */
    async initialize() {
        this.logger.info('Template manager initialized');
    }
    /**
     * Get all template categories
     * @returns Array of template categories
     */
    async getTemplateCategories() {
        const templateIds = this.templateEngine.getTemplateIds();
        const categories = new Set();
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
    async getTemplatesByCategory(category) {
        const allTemplates = this.templateEngine.getAllTemplates();
        return allTemplates.filter(template => template.id.startsWith(`${category}/`));
    }
    /**
     * Get all templates
     * @returns Array of all templates
     */
    async getAllTemplates() {
        return this.templateEngine.getAllTemplates();
    }
    /**
     * Create a document from a template
     * @param templateName Template name
     * @returns The created document
     */
    async createDocumentFromTemplate(templateName) {
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
    async getTemplateContext(template) {
        if (!template.schema) {
            return {}; // No schema, no context needed
        }
        const context = {};
        // Extract required properties from schema
        const requiredProps = template.schema.required || [];
        const properties = template.schema.properties || {};
        // Get input for each required property
        for (const propName of requiredProps) {
            const propSchema = properties[propName];
            if (!propSchema)
                continue;
            const title = propSchema.title || propName;
            const description = propSchema.description || '';
            if (propSchema.type === 'boolean') {
                const result = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: title,
                    title: description
                });
                context[propName] = result === 'Yes';
            }
            else if (propSchema.enum) {
                const result = await vscode.window.showQuickPick(propSchema.enum.map(String), {
                    placeHolder: title,
                    title: description
                });
                context[propName] = result;
            }
            else {
                const result = await vscode.window.showInputBox({
                    prompt: title,
                    placeHolder: description
                });
                // Convert to appropriate type
                if (propSchema.type === 'number' || propSchema.type === 'integer') {
                    context[propName] = Number(result);
                }
                else {
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
    async openTemplateForCustomization(templateName) {
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
        }
        catch {
            // Schema file doesn't exist
        }
    }
    /**
     * Dispose the template manager
     */
    dispose() {
        // No resources to dispose
    }
}
exports.TemplateManager = TemplateManager;
//# sourceMappingURL=templateManager.js.map