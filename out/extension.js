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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const serviceRegistry_1 = require("./core/serviceRegistry");
const documentIntelligence_1 = require("./providers/documentIntelligence");
const templateManager_1 = require("./managers/templateManager");
const legalProtection_1 = require("./services/legalProtection");
const complianceEngine_1 = require("./services/complianceEngine");
const eventBus_1 = require("./core/eventBus");
const logger_1 = require("./core/logger");
const templateEngine_1 = require("./templates/templateEngine");
const webviews_1 = require("./ui/webviews");
const treeviews_1 = require("./ui/treeviews");
/**
 * This method is called when the extension is activated.
 * Extension activation occurs when a supported file type is opened or
 * when a registered command is executed.
 */
async function activate(context) {
    // Initialize the logger
    const logger = new logger_1.Logger(context);
    logger.info('NSIP Legal IDE extension is now active');
    try {
        // Initialize the service registry
        const serviceRegistry = serviceRegistry_1.ServiceRegistry.getInstance();
        serviceRegistry.register('logger', logger);
        // Initialize the event bus
        const eventBus = new eventBus_1.EventBus();
        serviceRegistry.register('eventBus', eventBus);
        // Initialize core services
        const templateEngine = new templateEngine_1.TemplateEngine();
        await templateEngine.initialize();
        serviceRegistry.register('templateEngine', templateEngine);
        const templateManager = new templateManager_1.TemplateManager(context, templateEngine);
        await templateManager.initialize();
        serviceRegistry.register('templateManager', templateManager);
        const legalProtection = new legalProtection_1.LegalProtectionService();
        await legalProtection.initialize();
        serviceRegistry.register('legalProtection', legalProtection);
        const complianceEngine = new complianceEngine_1.ComplianceEngine();
        await complianceEngine.initialize();
        serviceRegistry.register('complianceEngine', complianceEngine);
        const documentIntelligence = new documentIntelligence_1.DocumentIntelligenceProvider(context);
        await documentIntelligence.initialize();
        serviceRegistry.register('documentIntelligence', documentIntelligence);
        // Register commands
        registerCommands(context);
        // Register providers
        registerProviders(context, documentIntelligence);
        // Initialize UI components
        (0, webviews_1.initializeWebViews)(context);
        (0, treeviews_1.initializeTreeViews)(context);
        logger.info('NSIP Legal IDE extension successfully activated');
    }
    catch (error) {
        logger.error('Failed to activate NSIP Legal IDE extension', error);
        throw error;
    }
}
/**
 * Register all extension commands
 */
function registerCommands(context) {
    const registry = serviceRegistry_1.ServiceRegistry.getInstance();
    const logger = registry.get('logger');
    const templateManager = registry.get('templateManager');
    const documentIntelligence = registry.get('documentIntelligence');
    const legalProtection = registry.get('legalProtection');
    const complianceEngine = registry.get('complianceEngine');
    // Create document command
    context.subscriptions.push(vscode.commands.registerCommand('nsip.createDocument', async () => {
        try {
            logger.info('Executing create document command');
            const documentTypes = await templateManager.getTemplateCategories();
            const selectedCategory = await vscode.window.showQuickPick(documentTypes, {
                placeHolder: 'Select document type'
            });
            if (!selectedCategory) {
                return;
            }
            const templates = await templateManager.getTemplatesByCategory(selectedCategory);
            const selectedTemplate = await vscode.window.showQuickPick(templates.map(t => t.name), { placeHolder: 'Select template' });
            if (!selectedTemplate) {
                return;
            }
            await templateManager.createDocumentFromTemplate(selectedTemplate);
            logger.info(`Document created from template: ${selectedTemplate}`);
        }
        catch (error) {
            logger.error('Error creating document', error);
            vscode.window.showErrorMessage(`Failed to create document: ${error.message}`);
        }
    }));
    // Analyze document command
    context.subscriptions.push(vscode.commands.registerCommand('nsip.analyzeDocument', async () => {
        try {
            logger.info('Executing analyze document command');
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active document to analyze');
                return;
            }
            const document = editor.document;
            const analysis = await documentIntelligence.analyzeDocument(document);
            // Show analysis in webview
            // This will be implemented in the UI components
            logger.info('Document analysis completed');
        }
        catch (error) {
            logger.error('Error analyzing document', error);
            vscode.window.showErrorMessage(`Failed to analyze document: ${error.message}`);
        }
    }));
    // Validate compliance command
    context.subscriptions.push(vscode.commands.registerCommand('nsip.validateCompliance', async () => {
        try {
            logger.info('Executing validate compliance command');
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active document to validate');
                return;
            }
            const document = editor.document;
            // Get available jurisdictions
            const jurisdictions = await complianceEngine.getAvailableJurisdictions();
            const selectedJurisdictions = await vscode.window.showQuickPick(jurisdictions, {
                placeHolder: 'Select jurisdictions to validate against',
                canPickMany: true
            });
            if (!selectedJurisdictions || selectedJurisdictions.length === 0) {
                return;
            }
            // Validate compliance for each selected jurisdiction
            const validationResults = await Promise.all(selectedJurisdictions.map(jurisdiction => complianceEngine.validateDocument(document, jurisdiction)));
            // Display validation results (will be implemented in UI components)
            logger.info('Compliance validation completed');
        }
        catch (error) {
            logger.error('Error validating compliance', error);
            vscode.window.showErrorMessage(`Failed to validate compliance: ${error.message}`);
        }
    }));
    // Track IP asset command
    context.subscriptions.push(vscode.commands.registerCommand('nsip.trackIPAsset', async () => {
        try {
            logger.info('Executing track IP asset command');
            const assetTypes = [
                'Patent',
                'Copyright',
                'Trademark',
                'Trade Secret',
                'Industrial Design'
            ];
            const selectedType = await vscode.window.showQuickPick(assetTypes, {
                placeHolder: 'Select IP asset type'
            });
            if (!selectedType) {
                return;
            }
            // Will be implemented in the IP management service
            await legalProtection.trackIPAsset(selectedType);
            logger.info(`IP asset tracked: ${selectedType}`);
        }
        catch (error) {
            logger.error('Error tracking IP asset', error);
            vscode.window.showErrorMessage(`Failed to track IP asset: ${error.message}`);
        }
    }));
    // Customize template command
    context.subscriptions.push(vscode.commands.registerCommand('nsip.customizeTemplate', async () => {
        try {
            logger.info('Executing customize template command');
            const templates = await templateManager.getAllTemplates();
            const selectedTemplate = await vscode.window.showQuickPick(templates.map(t => t.name), { placeHolder: 'Select template to customize' });
            if (!selectedTemplate) {
                return;
            }
            // Will be implemented in the template manager
            await templateManager.openTemplateForCustomization(selectedTemplate);
            logger.info(`Template opened for customization: ${selectedTemplate}`);
        }
        catch (error) {
            logger.error('Error customizing template', error);
            vscode.window.showErrorMessage(`Failed to customize template: ${error.message}`);
        }
    }));
}
/**
 * Register all language providers
 */
function registerProviders(context, documentIntelligence) {
    // Register language providers for legal document types
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider([{ language: 'nsip-legal' }, { language: 'markdown' }], documentIntelligence));
    // Register hover provider
    context.subscriptions.push(vscode.languages.registerHoverProvider([{ language: 'nsip-legal' }, { language: 'markdown' }], documentIntelligence));
    // Register diagnostic provider
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('nsip-legal');
    context.subscriptions.push(diagnosticCollection);
    // Add the diagnostic collection to the service registry
    serviceRegistry_1.ServiceRegistry.getInstance().register('diagnostics', diagnosticCollection);
}
/**
 * This method is called when the extension is deactivated
 */
function deactivate() {
    const registry = serviceRegistry_1.ServiceRegistry.getInstance();
    const logger = registry.get('logger');
    try {
        logger.info('Deactivating NSIP Legal IDE extension');
        // Dispose all services
        registry.disposeAll();
        logger.info('NSIP Legal IDE extension successfully deactivated');
    }
    catch (error) {
        logger.error('Error during extension deactivation', error);
    }
}
//# sourceMappingURL=extension.js.map