import * as vscode from 'vscode';
import { IService } from '../core/interfaces';
import { Logger } from '../core/logger';

/**
 * Interface for the dashboard view service
 */
export interface IDashboardView extends IService {
    /**
     * Show the dashboard
     */
    show(): void;
    
    /**
     * Update the dashboard content
     * @param data Data to display in the dashboard
     */
    update(data: DashboardData): void;
}

/**
 * Dashboard data model
 */
export interface DashboardData {
    complianceScore?: number;
    recentDocuments?: string[];
    recentTemplates?: string[];
    complianceIssueCount?: number;
    recommendationCount?: number;
}

/**
 * Implementation of the dashboard view using a VS Code WebView
 */
export class DashboardView implements IDashboardView {
    private panel: vscode.WebviewPanel | undefined;
    private data: DashboardData = {};
    private logger: Logger;
    
    constructor(logger: Logger) {
        this.logger = logger;
    }
    
    public async initialize(): Promise<void> {
        this.logger.debug('DashboardView initialized');
    }
    
    public dispose(): void {
        if (this.panel) {
            this.panel.dispose();
        }
        this.logger.debug('DashboardView disposed');
    }
    
    public show(): void {
        // Create or reveal the panel
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'nsipDashboard',
                'NSIP Legal Dashboard',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
            
            // Handle panel disposal
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
            
            // Handle message events from the webview
            this.panel.webview.onDidReceiveMessage(message => {
                this.handleWebviewMessage(message);
            });
        }
        
        // Update content
        this.updateWebviewContent();
    }
    
    public update(data: DashboardData): void {
        // Merge the new data with existing data
        this.data = { ...this.data, ...data };
        
        // Update the webview if it exists
        if (this.panel) {
            this.updateWebviewContent();
        }
    }
    
    /**
     * Handle messages from the webview
     */
    private handleWebviewMessage(message: any): void {
        switch (message.command) {
            case 'openDocument':
                if (message.path) {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(message.path));
                }
                break;
            case 'runComplianceCheck':
                vscode.commands.executeCommand('nsip.runComplianceCheck');
                break;
            case 'createDocument':
                vscode.commands.executeCommand('nsip.createNewDocument');
                break;
        }
    }
    
    /**
     * Update the webview HTML content
     */
    private updateWebviewContent(): void {
        if (!this.panel) {
            return;
        }
        
        this.panel.webview.html = this.getWebviewHtml();
    }
    
    /**
     * Generate the HTML for the webview
     */
    private getWebviewHtml(): string {
        const { complianceScore, recentDocuments, recentTemplates, complianceIssueCount, recommendationCount } = this.data;
        
        // Format compliance score as percentage
        const scorePercentage = complianceScore !== undefined ? Math.round(complianceScore * 100) : undefined;
        
        // Format score color based on value
        let scoreColor = '#999999'; // Default gray
        if (scorePercentage !== undefined) {
            if (scorePercentage >= 90) {
                scoreColor = '#4CAF50'; // Green
            } else if (scorePercentage >= 70) {
                scoreColor = '#FF9800'; // Orange
            } else {
                scoreColor = '#F44336'; // Red
            }
        }
        
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NSIP Legal Dashboard</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                }
                .dashboard {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-gap: 20px;
                }
                .card {
                    background-color: var(--vscode-editor-inactiveSelectionBackground);
                    border-radius: 6px;
                    padding: 15px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                }
                .metrics {
                    grid-column: 1 / -1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .metric {
                    text-align: center;
                    padding: 10px;
                }
                .metric-value {
                    font-size: 2em;
                    font-weight: bold;
                    margin: 5px 0;
                }
                .compliance-score {
                    color: ${scoreColor};
                }
                .card-title {
                    font-size: 1.2em;
                    margin-bottom: 15px;
                    border-bottom: 1px solid var(--vscode-editor-lineHighlightBorder);
                    padding-bottom: 5px;
                }
                .list-item {
                    display: flex;
                    padding: 8px 0;
                    cursor: pointer;
                    border-bottom: 1px solid var(--vscode-editor-lineHighlightBorder);
                }
                .list-item:hover {
                    background-color: var(--vscode-editor-hoverHighlightBackground);
                }
                .list-item-icon {
                    margin-right: 10px;
                }
                .button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 12px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-top: 10px;
                }
                .button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .empty-list {
                    font-style: italic;
                    color: var(--vscode-descriptionForeground);
                    padding: 10px 0;
                }
            </style>
        </head>
        <body>
            <h1>NSIP Legal Dashboard</h1>
            
            <div class="dashboard">
                <div class="card metrics">
                    <div class="metric">
                        <div>Compliance Score</div>
                        <div class="metric-value compliance-score">
                            ${scorePercentage !== undefined ? scorePercentage + '%' : 'N/A'}
                        </div>
                    </div>
                    <div class="metric">
                        <div>Compliance Issues</div>
                        <div class="metric-value">
                            ${complianceIssueCount !== undefined ? complianceIssueCount : 'N/A'}
                        </div>
                    </div>
                    <div class="metric">
                        <div>Recommendations</div>
                        <div class="metric-value">
                            ${recommendationCount !== undefined ? recommendationCount : 'N/A'}
                        </div>
                    </div>
                    <div>
                        <button class="button" id="runComplianceCheck">Run Compliance Check</button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-title">Recent Documents</div>
                    <div id="recentDocuments">
                        ${recentDocuments && recentDocuments.length > 0 ? 
                            recentDocuments.map(doc => `
                                <div class="list-item" data-path="${doc}">
                                    <div class="list-item-icon">📄</div>
                                    <div>${this.getFileName(doc)}</div>
                                </div>
                            `).join('') : 
                            '<div class="empty-list">No recent documents</div>'
                        }
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-title">Available Templates</div>
                    <div id="recentTemplates">
                        ${recentTemplates && recentTemplates.length > 0 ? 
                            recentTemplates.map(template => `
                                <div class="list-item" data-path="${template}">
                                    <div class="list-item-icon">📋</div>
                                    <div>${this.getFileName(template)}</div>
                                </div>
                            `).join('') : 
                            '<div class="empty-list">No templates available</div>'
                        }
                    </div>
                    <button class="button" id="createDocument">Create New Document</button>
                </div>
            </div>
            
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    
                    // Handle document clicks
                    document.getElementById('recentDocuments').addEventListener('click', (event) => {
                        const listItem = event.target.closest('.list-item');
                        if (listItem) {
                            vscode.postMessage({
                                command: 'openDocument',
                                path: listItem.dataset.path
                            });
                        }
                    });
                    
                    // Handle template clicks
                    document.getElementById('recentTemplates').addEventListener('click', (event) => {
                        const listItem = event.target.closest('.list-item');
                        if (listItem) {
                            vscode.postMessage({
                                command: 'openDocument',
                                path: listItem.dataset.path
                            });
                        }
                    });
                    
                    // Handle compliance check button
                    document.getElementById('runComplianceCheck').addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'runComplianceCheck'
                        });
                    });
                    
                    // Handle create document button
                    document.getElementById('createDocument').addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'createDocument'
                        });
                    });
                })();
            </script>
        </body>
        </html>`;
    }
    
    /**
     * Get file name from path
     */
    private getFileName(filePath: string): string {
        if (!filePath) return 'Unknown';
        const parts = filePath.split(/[/\\]/);
        const fileName = parts.pop();
        return fileName || 'Unknown';
    }
}
