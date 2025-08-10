/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { ServiceRegistry } from './core/serviceRegistry';
import { DocumentIntelligenceProvider } from './providers/documentIntelligence';
import { TemplateManager } from './managers/templateManager';
import { LegalProtectionService } from './services/legalProtection';
import { ComplianceEngine } from './compliance/complianceEngine';
import { EventBus } from './core/eventBus';
import { Logger } from './core/logger';
import { TemplateEngine } from './templates/templateEngine';
import { TemplateComplianceValidator } from './templates/templateComplianceValidator';
import { initializeBlockchainComponents } from './blockchain';
import { registerFeatures } from './features';
import { DocumentAnalyzerService } from './core/services/DocumentAnalyzerService';
import { ComplianceAnalyzerService } from './core/services/ComplianceAnalyzerService';
import { DocumentGeneratorService } from './core/services/DocumentGeneratorService';
import { TemplateManagerService } from './core/services/TemplateManagerService';
import { DocumentCommandHandler } from './core/handlers/DocumentCommandHandler';
import { DocumentTreeProvider } from './core/providers/DocumentTreeProvider';
import { 
    NotificationManager, 
    ComplianceView, 
    DocumentExplorer, 
    DashboardView,
    StatusBarManager,
    QuickPickService,
    WebviewService
} from './ui';
import { TemplateHistoryViewProvider } from './ui/TemplateHistoryViewProvider';
import { ComplianceRuleManagerViewProvider } from './ui/ComplianceRuleManagerViewProvider';
import { DocumentAnalysisViewProvider } from './ui/DocumentAnalysisViewProvider';

/**
 * This method is called when the extension is activated.
 * Extension activation occurs when a supported file type is opened or 
 * when a registered command is executed.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    // Initialize the logger
    const logger = new Logger(context);
    logger.info('NSIP Legal IDE extension is now active');

    try {
        // Initialize the service registry
        const serviceRegistry = ServiceRegistry.getInstance();
        serviceRegistry.register('logger', logger);

        // Initialize the event bus
        const eventBus = new EventBus();
        serviceRegistry.register('eventBus', eventBus);
        
        // Initialize core services
        const templateEngine = new TemplateEngine();
        await templateEngine.initialize();
        serviceRegistry.register('templateEngine', templateEngine);

        // Initialize document services
        const documentAnalyzer = new DocumentAnalyzerService(context);
        const complianceAnalyzer = new ComplianceAnalyzerService(context);
        const documentGenerator = new DocumentGeneratorService(context);
        const templateManagerService = new TemplateManagerService(context);

        // Register document command handler
        new DocumentCommandHandler(
            context,
            documentAnalyzer,
            complianceAnalyzer,
            documentGenerator,
            templateManagerService
        );

        // Register document tree provider
        const treeProvider = new DocumentTreeProvider(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
        vscode.window.registerTreeDataProvider('nsipDocuments', treeProvider);

        // Register feature modules
        registerFeatures(context);

        // Register feature modules
        registerFeatures(context);
        
        const templateManager = new TemplateManager(context, templateEngine);
        await templateManager.initialize();
        serviceRegistry.register('templateManager', templateManager);
        
        const legalProtection = new LegalProtectionService();
        await legalProtection.initialize();
        serviceRegistry.register('legalProtection', legalProtection);
        
        const complianceEngine = new ComplianceEngine(eventBus, logger);
        await complianceEngine.initialize();
        serviceRegistry.register('complianceEngine', complianceEngine);
        
        // Initialize the template compliance validator to integrate template and compliance engines
        const templateComplianceValidator = new TemplateComplianceValidator(
            templateEngine,
            complianceEngine,
            logger
        );
        await templateComplianceValidator.initialize();
        serviceRegistry.register('templateComplianceValidator', templateComplianceValidator);
        
        const documentIntelligence = new DocumentIntelligenceProvider(context);
        await documentIntelligence.initialize();
        serviceRegistry.register('documentIntelligence', documentIntelligence);
        
        // Initialize blockchain components
        await initializeBlockchainComponents(context);
        
        // Initialize UI components
        const notificationManager = new NotificationManager(logger);
        await notificationManager.initialize();
        serviceRegistry.register('notificationManager', notificationManager);
        
        const complianceView = new ComplianceView(logger);
        await complianceView.initialize();
        serviceRegistry.register('complianceView', complianceView);
        
        const documentExplorer = new DocumentExplorer(logger);
        await documentExplorer.initialize();
        serviceRegistry.register('documentExplorer', documentExplorer);
        
        const statusBarManager = new StatusBarManager(logger);
        await statusBarManager.initialize();
        serviceRegistry.register('statusBarManager', statusBarManager);
        
        const quickPickService = new QuickPickService(logger);
        await quickPickService.initialize();
        serviceRegistry.register('quickPickService', quickPickService);
        
        const webviewService = new WebviewService(logger, context);
        await webviewService.initialize();
        serviceRegistry.register('webviewService', webviewService);
        
        const dashboardView = new DashboardView(logger);
        await dashboardView.initialize();
        serviceRegistry.register('dashboardView', dashboardView);
        
        // Register Template History View
        const templateHistoryProvider = new TemplateHistoryViewProvider(context);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('nsipTemplateHistory', templateHistoryProvider)
        );

        // Register Compliance Rule Manager View
        const complianceRuleManagerProvider = new ComplianceRuleManagerViewProvider(context);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('nsipComplianceRuleManager', complianceRuleManagerProvider)
        );

        // Register Document Analysis View
        const documentAnalysisProvider = new DocumentAnalysisViewProvider(context);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('nsipDocumentAnalysisView', documentAnalysisProvider)
        );

        // Register commands
        registerCommands(context);
        
        // Register providers
        registerProviders(context, documentIntelligence);
        
        logger.info('NSIP Legal IDE extension successfully activated');
    } catch (error) {
        logger.error('Failed to activate NSIP Legal IDE extension', error);
        throw error;
    }
}

/**
 * Register all extension commands
 */
function registerCommands(context: vscode.ExtensionContext): void {
    const registry = ServiceRegistry.getInstance();
    const logger = registry.get<Logger>('logger');
    const templateManager = registry.get<TemplateManager>('templateManager');
    const documentIntelligence = registry.get<DocumentIntelligenceProvider>('documentIntelligence');
    const complianceEngine = registry.get<ComplianceEngine>('complianceEngine');
    
    // Create document command
    context.subscriptions.push(
        vscode.commands.registerCommand('nsip.createDocument', async () => {
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
                const selectedTemplate = await vscode.window.showQuickPick(
                    templates.map(t => t.id),
                    { placeHolder: 'Select template' }
                );
                
                if (!selectedTemplate) {
                    return;
                }
                
                await templateManager.createDocumentFromTemplate(selectedTemplate);
                logger.info(`Document created from template: ${selectedTemplate}`);
            } catch (error) {
                logger.error('Error creating document', error);
                vscode.window.showErrorMessage(`Failed to create document: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );
    
    // Analyze document command
    context.subscriptions.push(
        vscode.commands.registerCommand('nsip.analyzeDocument', async () => {
            try {
                logger.info('Executing analyze document command');
                
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('No active document to analyze');
                    return;
                }
                
                const document = editor.document;
                await documentIntelligence.analyzeDocument(document);
                
                // Show analysis in webview
                // This will be implemented in the UI components
                logger.info('Document analysis completed');
            } catch (error) {
                logger.error('Error analyzing document', error);
                vscode.window.showErrorMessage(`Failed to analyze document: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );
    
    // Validate compliance command
    context.subscriptions.push(
        vscode.commands.registerCommand('nsip.validateCompliance', async () => {
            try {
                logger.info('Executing validate compliance command');
                
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('No active document to validate');
                    return;
                }
                
                const document = editor.document;
                
                // Create sample organization for validation
                const organization = {
                    id: 'current-org',
                    name: 'Current Organization',
                    type: 'company',
                    industry: ['technology', 'legal'],
                    size: 100,
                    jurisdictions: ['US', 'EU', 'UK'],
                    regulatoryFrameworks: ['GDPR', 'CCPA', 'HIPAA'],
                    subsidiaries: [],
                    publiclyTraded: false,
                    riskProfile: 'medium'
                };
                
                // Create temporary LegalDocument from the current document
                const legalDocument = {
                    id: document.uri.toString(),
                    title: document.fileName.split('/').pop() || 'Untitled',
                    content: document.getText(),
                    type: 'agreement' as const,
                    metadata: {},
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    version: '1.0',
                    authors: ['Current User'],
                    status: 'draft' as const
                };
                
                // Validate document
                const validationOptions = {
                    organization,
                    jurisdictions: organization.jurisdictions,
                    frameworks: organization.regulatoryFrameworks,
                    strictMode: false,
                    includeRecommendations: true,
                    includeRiskAssessment: true
                };
                
                const validationResult = complianceEngine.validateDocument(legalDocument, validationOptions);
                
                // Show diagnostics
                const diagnostics = complianceEngine.getDiagnostics(legalDocument, validationOptions);
                const diagnosticCollection = vscode.languages.createDiagnosticCollection('nsip-compliance');
                context.subscriptions.push(diagnosticCollection);
                diagnosticCollection.set(document.uri, diagnostics);
                
                // Display validation summary
                const issues = validationResult.issues.length;
                const score = Math.round(validationResult.score * 100);
                
                // Update status bar
                const statusBarManager = registry.get<StatusBarManager>('statusBarManager');
                statusBarManager.showComplianceStatus(validationResult.score, `${issues} compliance issues found`);
                
                // Show issues in the compliance view
                const complianceView = registry.get<ComplianceView>('complianceView');
                complianceView.showIssues(validationResult.issues, document.uri);
                
                // Show notification
                const notificationManager = registry.get<NotificationManager>('notificationManager');
                notificationManager.showInformation(
                    `Compliance Score: ${score}% - ${issues} issues found.`,
                    'View Details'
                ).then(selection => {
                    if (selection === 'View Details') {
                        complianceView.focus();
                    }
                });
                
                logger.info('Compliance validation completed');
            } catch (error) {
                logger.error('Error validating compliance', error);
                vscode.window.showErrorMessage(`Failed to validate compliance: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );
    
    // Track IP asset command
    context.subscriptions.push(
        vscode.commands.registerCommand('nsip.trackIPAsset', async () => {
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
                
                // Track IP asset (to be implemented)
                // Replace with proper implementation later
                logger.info(`IP asset tracking requested: ${selectedType}`);
            } catch (error) {
                logger.error('Error tracking IP asset', error);
                vscode.window.showErrorMessage(`Failed to track IP asset: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );
    
    // Customize template command
    context.subscriptions.push(
        vscode.commands.registerCommand('nsip.customizeTemplate', async () => {
            try {
                logger.info('Executing customize template command');
                
                // Temporarily simplified template listing
                const templateNames = ['Contract', 'NDA', 'License Agreement', 'Terms of Service'];
                const selectedTemplate = await vscode.window.showQuickPick(
                    templateNames,
                    { placeHolder: 'Select template to customize' }
                );
                
                if (!selectedTemplate) {
                    return;
                }
                
                // Will be implemented in the template manager
                await templateManager.openTemplateForCustomization(selectedTemplate);
                logger.info(`Template opened for customization: ${selectedTemplate}`);
            } catch (error) {
                logger.error('Error customizing template', error);
                vscode.window.showErrorMessage(`Failed to customize template: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );

    // Show dashboard command
    context.subscriptions.push(
        vscode.commands.registerCommand('nsip.showDashboard', async () => {
            try {
                logger.info('Executing show dashboard command');
                
                const dashboardView = registry.get<DashboardView>('dashboardView');
                dashboardView.show();
                
                // Update dashboard with current data
                const templateManager = registry.get<TemplateManager>('templateManager');
                
                // Get recent documents and templates
                const recentDocuments = await vscode.workspace.findFiles('**/*.{md,txt,doc,docx}', '**/node_modules/**', 10);
                const recentTemplates = await templateManager.getAllTemplates();
                
                // Create mock compliance statistics
                const complianceStats = {
                    averageScore: 0.85,
                    totalIssues: 12,
                    totalRecommendations: 5
                };
                
                // Update dashboard with data
                dashboardView.update({
                    complianceScore: complianceStats.averageScore,
                    complianceIssueCount: complianceStats.totalIssues,
                    recommendationCount: complianceStats.totalRecommendations,
                    recentDocuments: recentDocuments.map(uri => uri.fsPath),
                    recentTemplates: recentTemplates.map(t => t.id)
                });
                
                logger.info('Dashboard displayed');
            } catch (error) {
                logger.error('Error showing dashboard', error);
                vscode.window.showErrorMessage(`Failed to show dashboard: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );
    
    // Refresh document explorer command
    context.subscriptions.push(
        vscode.commands.registerCommand('nsip.refreshDocumentExplorer', async () => {
            try {
                logger.info('Refreshing document explorer');
                
                const documentExplorer = registry.get<DocumentExplorer>('documentExplorer');
                documentExplorer.refresh();
                
                logger.info('Document explorer refreshed');
            } catch (error) {
                logger.error('Error refreshing document explorer', error);
                vscode.window.showErrorMessage(`Failed to refresh document explorer: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );
    
    // Refresh compliance view command
    context.subscriptions.push(
        vscode.commands.registerCommand('nsip.refreshComplianceView', async () => {
            try {
                logger.info('Refreshing compliance view');
                
                // Get current document
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return;
                }
                
                // Re-run compliance validation
                await vscode.commands.executeCommand('nsip.validateCompliance');
                
                logger.info('Compliance view refreshed');
            } catch (error) {
                logger.error('Error refreshing compliance view', error);
                vscode.window.showErrorMessage(`Failed to refresh compliance view: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );
    
    // Clear compliance issues command
    context.subscriptions.push(
        vscode.commands.registerCommand('nsip.clearComplianceIssues', async () => {
            try {
                logger.info('Clearing compliance issues');
                
                const complianceView = registry.get<ComplianceView>('complianceView');
                complianceView.clearIssues();
                
                // Clear diagnostics
                const diagnosticCollection = vscode.languages.createDiagnosticCollection('nsip-compliance');
                diagnosticCollection.clear();
                
                // Update status bar
                const statusBarManager = registry.get<StatusBarManager>('statusBarManager');
                statusBarManager.showMessage('NSIP Legal IDE Ready');
                
                logger.info('Compliance issues cleared');
            } catch (error) {
                logger.error('Error clearing compliance issues', error);
                vscode.window.showErrorMessage(`Failed to clear compliance issues: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );
}

/**
 * Register all language providers
 */
function registerProviders(
    context: vscode.ExtensionContext,
    documentIntelligence: DocumentIntelligenceProvider
): void {
    // Register language providers for legal document types
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            [{ language: 'nsip-legal' }, { language: 'markdown' }],
            documentIntelligence
        )
    );
    
    // Register hover provider
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            [{ language: 'nsip-legal' }, { language: 'markdown' }],
            documentIntelligence
        )
    );
    
    // Register diagnostic provider
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('nsip-legal');
    context.subscriptions.push(diagnosticCollection);
    
    // Add the diagnostic collection to the service registry
    // Note: Not using registry for diagnostics as it's not an IService
    // If we need diagnostics elsewhere, we should pass it as a parameter
}

/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */
export function deactivate(): void {
    const registry = ServiceRegistry.getInstance();
    const logger = registry.get<Logger>('logger');
    
    try {
        logger.info('Deactivating NSIP Legal IDE extension');
        
        // Dispose all services
        registry.disposeAll();
        
        logger.info('NSIP Legal IDE extension successfully deactivated');
    } catch (error) {
        logger.error('Error during extension deactivation', error);
    }
}
