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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.TemplateEngine = void 0;
const vscode = __importStar(require("vscode"));
const handlebars = __importStar(require("handlebars"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const ajv_1 = __importDefault(require("ajv"));
const readFile = (0, util_1.promisify)(fs.readFile);
const writeFile = (0, util_1.promisify)(fs.writeFile);
const mkdir = (0, util_1.promisify)(fs.mkdir);
const readdir = (0, util_1.promisify)(fs.readdir);
const stat = (0, util_1.promisify)(fs.stat);
/**
 * Template Engine - Provides template loading, rendering, and validation
 */
class TemplateEngine {
    constructor() {
        this.templates = new Map();
        this.compiledTemplates = new Map();
        this.templateBasePath = '';
        this.ajv = new ajv_1.default({
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
    async initialize() {
        // Get template path from configuration
        const config = vscode.workspace.getConfiguration('nsip');
        this.templateBasePath = config.get('templates.repository', './templates');
        // Make the template path absolute
        if (!path.isAbsolute(this.templateBasePath)) {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                this.templateBasePath = path.join(workspaceFolders[0].uri.fsPath, this.templateBasePath);
            }
            else {
                throw new Error('No workspace folder available for template path');
            }
        }
        // Create template directory if it doesn't exist
        try {
            await mkdir(this.templateBasePath, { recursive: true });
        }
        catch (error) {
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
    registerHelpers() {
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
        handlebars.registerHelper('uppercase', (value) => typeof value === 'string' ? value.toUpperCase() : value);
        handlebars.registerHelper('lowercase', (value) => typeof value === 'string' ? value.toLowerCase() : value);
        handlebars.registerHelper('capitalize', (value) => {
            if (typeof value !== 'string')
                return value;
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
    async loadAllTemplates() {
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
                    }
                    catch (error) {
                        console.error(`Failed to load template ${templateId}:`, error);
                    }
                }
            }
        }
        catch (error) {
            console.error('Failed to load templates:', error);
            throw error;
        }
    }
    /**
     * Get all directories in a path
     * @param dirPath Directory path
     * @returns Array of directory names
     */
    async getDirectories(dirPath) {
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
    async getFiles(dirPath, extension) {
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
    async loadTemplate(templateId, templatePath) {
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
        }
        catch (error) {
            console.error(`Failed to load schema for template ${templateId}:`, error);
        }
        // Compile template
        const compiled = handlebars.compile(templateContent);
        // Store template
        const template = {
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
    getTemplateIds() {
        return Array.from(this.templates.keys());
    }
    /**
     * Get template by ID
     * @param templateId Template ID
     * @returns Template object
     */
    getTemplate(templateId) {
        return this.templates.get(templateId);
    }
    /**
     * Get all templates
     * @returns Array of all templates
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    /**
     * Validate context against template schema
     * @param templateId Template ID
     * @param context Context object
     * @returns Validation result
     */
    validateContext(templateId, context) {
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
    renderTemplate(templateId, context) {
        const compiled = this.compiledTemplates.get(templateId);
        if (!compiled) {
            throw new Error(`Template ${templateId} not found`);
        }
        // Validate context if schema exists
        const validationResult = this.validateContext(templateId, context);
        if (!validationResult.valid) {
            throw new ValidationError(`Invalid context for template ${templateId}`, validationResult.errors);
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
    async createTemplate(category, name, content, schema) {
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
    async updateTemplate(templateId, content, schema) {
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
    async deleteTemplate(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} not found`);
        }
        // Delete template file
        await (0, util_1.promisify)(fs.unlink)(template.path);
        // Delete schema file if it exists
        const schemaPath = template.path.replace('.hbs', '.schema.json');
        if (fs.existsSync(schemaPath)) {
            await (0, util_1.promisify)(fs.unlink)(schemaPath);
        }
        // Remove from maps
        this.templates.delete(templateId);
        this.compiledTemplates.delete(templateId);
    }
    /**
     * Dispose the template engine
     */
    dispose() {
        this.templates.clear();
        this.compiledTemplates.clear();
    }
}
exports.TemplateEngine = TemplateEngine;
/**
 * Validation error class
 */
class ValidationError extends Error {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=templateEngine.js.map