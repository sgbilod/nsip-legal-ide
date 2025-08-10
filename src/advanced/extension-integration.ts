/**
 * Extension integration for advanced AI/ML features
 * 
 * This file shows how to integrate the advanced AI/ML features into the extension.ts file
 */

import * as vscode from 'vscode';
import { IService, IServiceProvider } from '../core/interfaces';
import { Commands } from '../commands';
import { ServiceRegistry } from '../core/serviceRegistry';
import { EventBus } from '../core/eventBus';
import { Logger, LogLevel } from '../core/logger';

// Import services
import { DocumentAnalyzer } from '../ai/documentAnalyzer';
import { ClauseDetector } from '../ai/clauseDetector';
import { TemplateEngine } from '../templates/templateEngine';
import { DocumentGenerator } from '../generation/documentGenerator';

/**
 * Service container class for managing the lifecycle of all services
 */
class ServiceContainer implements IServiceProvider {
    private registry: ServiceRegistry;
    private eventBus: EventBus;
    private logger: Logger;
    
    constructor() {
        this.eventBus = new EventBus();
        this.logger = new Logger({ 
            level: LogLevel.INFO,
            enableConsoleOutput: true
        });
        this.registry = new ServiceRegistry(this.eventBus, this.logger);
    }
    
    /**
     * Initialize all services
     */
    async initialize(): Promise<void> {
        this.logger.info('Initializing services');
        
        // Register core services
        this.registry.register('eventBus', this.eventBus);
        this.registry.register('logger', this.logger);
        
        // Register AI services
        this.registry.register('documentAnalyzer', new DocumentAnalyzer(this));
        this.registry.register('clauseDetector', new ClauseDetector(this));
        
        // Register template services
        this.registry.register('templateEngine', new TemplateEngine(this));
        this.registry.register('documentGenerator', new DocumentGenerator(this));
        
        // Initialize all registered services
        await this.registry.initializeAll();
        
        this.logger.info('All services initialized');
    }
    
    /**
     * Dispose all services
     */
    async dispose(): Promise<void> {
        this.logger.info('Disposing services');
        await this.registry.disposeAll();
        this.logger.info('All services disposed');
    }
    
    /**
     * Get a service by type
     * 
     * @param type Service type
     * @returns Service instance or null if not found
     */
    getService<T>(type: string): T | null {
        return this.registry.get(type) as T;
    }
}

/**
 * Integration with VS Code extension
 */
export function activateAdvancedFeatures(context: vscode.ExtensionContext): void {
    const container = new ServiceContainer();
    
    // Initialize services
    container.initialize().catch(err => {
        vscode.window.showErrorMessage(`Failed to initialize services: ${err.message}`);
    });
    
    // Dispose services when extension is deactivated
    context.subscriptions.push({
        dispose: () => {
            container.dispose().catch(err => {
                console.error('Failed to dispose services:', err);
            });
        }
    });
    
    // Register document analysis command
    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.ANALYZE_DOCUMENT, async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active document to analyze');
                return;
            }
            
            const analyzer = container.getService<DocumentAnalyzer>('documentAnalyzer');
            if (!analyzer) {
                vscode.window.showErrorMessage('Document analyzer service not available');
                return;
            }
            
            try {
                const document = editor.document;
                const text = document.getText();
                const result = await analyzer.analyze(text);
                
                // Show analysis results
                vscode.window.showInformationMessage('Document analysis completed');
                
                // Create and show webview with results
                const panel = vscode.window.createWebviewPanel(
                    'documentAnalysis',
                    'Document Analysis Results',
                    vscode.ViewColumn.Beside,
                    { enableScripts: true }
                );
                
                panel.webview.html = getAnalysisResultsHtml(result);
            } catch (err) {
                vscode.window.showErrorMessage(`Document analysis failed: ${err.message}`);
            }
        })
    );
    
    // Setup document change listener for intelligent features
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            const clauseDetector = container.getService<ClauseDetector>('clauseDetector');
            if (clauseDetector && event.contentChanges.length > 0) {
                // Only process legal document file types
                if (event.document.languageId === 'markdown' || 
                    event.document.fileName.endsWith('.md') ||
                    event.document.fileName.endsWith('.legal')) {
                    
                    // Detect clauses in the changed document
                    clauseDetector.detectClauses(event.document.getText())
                        .then(clauses => {
                            if (clauses.length > 0) {
                                // Provide smart suggestions based on detected clauses
                                // This is just a placeholder for the actual implementation
                                console.log('Detected clauses:', clauses);
                            }
                        })
                        .catch(err => {
                            console.error('Clause detection failed:', err);
                        });
                }
            }
        })
    );
}

/**
 * Generate HTML to display analysis results
 * 
 * @param results Analysis results
 * @returns HTML string
 */
function getAnalysisResultsHtml(results: any): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document Analysis Results</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    padding: 20px;
                }
                .result-section {
                    margin-bottom: 20px;
                    border: 1px solid #ddd;
                    padding: 15px;
                    border-radius: 4px;
                }
                h2 {
                    margin-top: 0;
                    color: #333;
                }
                .risk-high {
                    color: #d73a49;
                }
                .risk-medium {
                    color: #e36209;
                }
                .risk-low {
                    color: #28a745;
                }
            </style>
        </head>
        <body>
            <h1>Document Analysis Results</h1>
            
            <div class="result-section">
                <h2>Document Summary</h2>
                <p>${results.summary || 'No summary available'}</p>
            </div>
            
            <div class="result-section">
                <h2>Detected Clauses</h2>
                <ul>
                    ${(results.clauses || []).map((clause: any) => `
                        <li>
                            <strong>${clause.type}:</strong> 
                            ${clause.text}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="result-section">
                <h2>Risk Assessment</h2>
                <ul>
                    ${(results.risks || []).map((risk: any) => `
                        <li class="risk-${risk.level.toLowerCase()}">
                            <strong>${risk.category}:</strong> 
                            ${risk.description} (${risk.level.toUpperCase()})
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="result-section">
                <h2>Suggested Improvements</h2>
                <ul>
                    ${(results.suggestions || []).map((suggestion: any) => `
                        <li>
                            <strong>${suggestion.category}:</strong> 
                            ${suggestion.text}
                        </li>
                    `).join('')}
                </ul>
            </div>
        </body>
        </html>
    `;
}

/**
 * Deactivation handler
 * 
 * @param context Extension context
 */
export function deactivateAdvancedFeatures(context: vscode.ExtensionContext): void {
    // All cleanup should be handled by the disposables registered in the activation
    console.log('Advanced features deactivated');
}
