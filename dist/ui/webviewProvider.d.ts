import * as vscode from 'vscode';
/**
 * WebView Provider - Creates and manages VS Code webviews
 */
export declare class WebViewProvider implements vscode.WebviewViewProvider, vscode.Disposable {
    private readonly context;
    private logger;
    private eventBus;
    private webviews;
    private disposables;
    /**
     * Create a new WebView Provider
     * @param context Extension context
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Resolve a webview view
     * @param webviewView Webview view
     * @param context Webview view context
     * @param token Cancellation token
     */
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void>;
    /**
     * Load webview content based on view ID
     * @param webviewView Webview view
     */
    private loadWebviewContent;
    /**
     * Handle messages from webviews
     * @param viewId Webview ID
     * @param message Message data
     */
    private handleWebviewMessage;
    /**
     * Send message to a webview
     * @param viewId Webview ID
     * @param message Message data
     */
    sendMessageToWebview(viewId: string, message: any): Promise<boolean>;
    /**
     * Handle template update event
     * @param data Event data
     */
    private handleTemplateUpdate;
    /**
     * Handle document validation event
     * @param data Event data
     */
    private handleDocumentValidation;
    /**
     * Handle create template command
     * @param data Command data
     */
    private handleCreateTemplate;
    /**
     * Handle edit template command
     * @param data Command data
     */
    private handleEditTemplate;
    /**
     * Handle validate document command
     * @param data Command data
     */
    private handleValidateDocument;
    /**
     * Handle create IP asset command
     * @param data Command data
     */
    private handleCreateIPAsset;
    /**
     * Handle get templates command
     */
    private handleGetTemplates;
    /**
     * Handle get IP assets command
     */
    private handleGetIPAssets;
    /**
     * Get template explorer HTML
     * @param webview Webview
     * @returns HTML content
     */
    private getTemplateExplorerHtml;
    /**
     * Get document validator HTML
     * @param webview Webview
     * @returns HTML content
     */
    private getDocumentValidatorHtml;
    /**
     * Get IP asset manager HTML
     * @param webview Webview
     * @returns HTML content
     */
    private getIPAssetManagerHtml;
    /**
     * Get default HTML
     * @param webview Webview
     * @returns HTML content
     */
    private getDefaultHtml;
    /**
     * Dispose webview provider
     */
    dispose(): void;
}
