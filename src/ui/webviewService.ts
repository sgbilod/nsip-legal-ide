import * as vscode from 'vscode';
import { IService } from '../core/interfaces';
import { Logger } from '../core/logger';

/**
 * Interface for webview service
 */
export interface IWebviewService extends IService {
    /**
     * Create a new webview panel
     * @param viewType Unique identifier for the webview type
     * @param title Title to display in the webview tab
     * @param content HTML content for the webview
     * @param options Optional webview options
     * @param column Column to display the webview in
     * @returns The webview panel
     */
    createWebviewPanel(
        viewType: string,
        title: string,
        content: string,
        options?: WebviewOptions,
        column?: vscode.ViewColumn
    ): vscode.WebviewPanel;
    
    /**
     * Get existing webview panel by type
     * @param viewType The type of webview to get
     * @returns The webview panel or undefined if not found
     */
    getWebviewPanel(viewType: string): vscode.WebviewPanel | undefined;
    
    /**
     * Register a message handler for a webview
     * @param viewType The type of webview to handle messages for
     * @param handler The handler function for webview messages
     */
    registerMessageHandler(viewType: string, handler: (message: any) => void): void;
}

/**
 * Options for creating a webview
 */
export interface WebviewOptions {
    enableScripts?: boolean;
    retainContextWhenHidden?: boolean;
    enableFindWidget?: boolean;
    localResourceRoots?: vscode.Uri[];
}

/**
 * Implementation of the webview service
 */
export class WebviewService implements IWebviewService {
    private webviews: Map<string, vscode.WebviewPanel> = new Map();
    private messageHandlers: Map<string, (message: any) => void> = new Map();
    private logger: Logger;
    private extensionContext: vscode.ExtensionContext;
    
    constructor(logger: Logger, extensionContext: vscode.ExtensionContext) {
        this.logger = logger;
        this.extensionContext = extensionContext;
    }
    
    public async initialize(): Promise<void> {
        this.logger.debug('WebviewService initialized');
    }
    
    public dispose(): void {
        // Dispose all webviews
        for (const webview of this.webviews.values()) {
            webview.dispose();
        }
        
        this.webviews.clear();
        this.messageHandlers.clear();
        
        this.logger.debug('WebviewService disposed');
    }
    
    public createWebviewPanel(
        viewType: string,
        title: string,
        content: string,
        options?: WebviewOptions,
        column: vscode.ViewColumn = vscode.ViewColumn.One
    ): vscode.WebviewPanel {
        // Check if webview already exists
        const existingPanel = this.webviews.get(viewType);
        if (existingPanel) {
            existingPanel.reveal(column);
            existingPanel.webview.html = content;
            return existingPanel;
        }
        
        // Create panel
        const panel = vscode.window.createWebviewPanel(
            viewType,
            title,
            column,
            {
                enableScripts: options?.enableScripts ?? true,
                enableFindWidget: options?.enableFindWidget ?? true,
                retainContextWhenHidden: options?.retainContextWhenHidden ?? true,
                localResourceRoots: options?.localResourceRoots ?? [this.extensionContext.extensionUri]
            }
        );
        
        // Set content
        panel.webview.html = content;
        
        // Store panel
        this.webviews.set(viewType, panel);
        
        // Handle disposal
        panel.onDidDispose(() => {
            this.webviews.delete(viewType);
            this.logger.debug(`Webview ${viewType} disposed`);
        });
        
        // Set up message handler
        const handler = this.messageHandlers.get(viewType);
        if (handler) {
            panel.webview.onDidReceiveMessage(message => {
                this.logger.debug(`Received message from webview ${viewType}: ${JSON.stringify(message)}`);
                handler(message);
            });
        }
        
        this.logger.debug(`Created webview ${viewType}`);
        return panel;
    }
    
    public getWebviewPanel(viewType: string): vscode.WebviewPanel | undefined {
        return this.webviews.get(viewType);
    }
    
    public registerMessageHandler(viewType: string, handler: (message: any) => void): void {
        this.messageHandlers.set(viewType, handler);
        
        // If webview already exists, attach handler
        const panel = this.webviews.get(viewType);
        if (panel) {
            panel.webview.onDidReceiveMessage(message => {
                this.logger.debug(`Received message from webview ${viewType}: ${JSON.stringify(message)}`);
                handler(message);
            });
        }
        
        this.logger.debug(`Registered message handler for webview ${viewType}`);
    }
    
    /**
     * Helper method to get webview resource URI
     * @param webview The webview
     * @param relativePath The relative path to the resource
     * @returns The URI for the resource
     */
    public getResourceUri(webview: vscode.Webview, relativePath: string): vscode.Uri {
        return webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionContext.extensionUri, relativePath)
        );
    }
}
