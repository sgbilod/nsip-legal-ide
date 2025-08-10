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
exports.WebViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const serviceRegistry_1 = require("../core/serviceRegistry");
/**
 * WebView Provider - Creates and manages VS Code webviews
 */
class WebViewProvider {
    /**
     * Create a new WebView Provider
     * @param context Extension context
     */
    constructor(context) {
        this.context = context;
        this.webviews = new Map();
        this.disposables = [];
        this.logger = serviceRegistry_1.ServiceRegistry.getInstance().get('logger');
        this.eventBus = serviceRegistry_1.ServiceRegistry.getInstance().get('eventBus');
        // Register webview provider
        this.disposables.push(vscode.window.registerWebviewViewProvider('nsipLegal.templateExplorer', this, { webviewOptions: { retainContextWhenHidden: true } }));
        // Register handlers for events
        this.eventBus.subscribe('template.updated', this.handleTemplateUpdate.bind(this));
        this.eventBus.subscribe('document.validated', this.handleDocumentValidation.bind(this));
    }
    /**
     * Resolve a webview view
     * @param webviewView Webview view
     * @param context Webview view context
     * @param token Cancellation token
     */
    resolveWebviewView(webviewView, context, token) {
        const viewId = webviewView.viewType;
        this.logger.info(`Resolving webview: ${viewId}`);
        // Store webview for later reference
        this.webviews.set(viewId, webviewView);
        // Set options
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'dist')
            ]
        };
        // Load content
        this.loadWebviewContent(webviewView);
        // Handle messages
        webviewView.webview.onDidReceiveMessage(this.handleWebviewMessage.bind(this, viewId), undefined, this.disposables);
    }
    /**
     * Load webview content based on view ID
     * @param webviewView Webview view
     */
    loadWebviewContent(webviewView) {
        const viewId = webviewView.viewType;
        switch (viewId) {
            case 'nsipLegal.templateExplorer':
                webviewView.webview.html = this.getTemplateExplorerHtml(webviewView.webview);
                break;
            case 'nsipLegal.documentValidator':
                webviewView.webview.html = this.getDocumentValidatorHtml(webviewView.webview);
                break;
            case 'nsipLegal.ipAssetManager':
                webviewView.webview.html = this.getIPAssetManagerHtml(webviewView.webview);
                break;
            default:
                webviewView.webview.html = this.getDefaultHtml(webviewView.webview);
                break;
        }
    }
    /**
     * Handle messages from webviews
     * @param viewId Webview ID
     * @param message Message data
     */
    handleWebviewMessage(viewId, message) {
        this.logger.debug(`Received message from webview ${viewId}:`, message);
        switch (message.command) {
            case 'createTemplate':
                this.handleCreateTemplate(message.data);
                break;
            case 'editTemplate':
                this.handleEditTemplate(message.data);
                break;
            case 'validateDocument':
                this.handleValidateDocument(message.data);
                break;
            case 'createIPAsset':
                this.handleCreateIPAsset(message.data);
                break;
            case 'getTemplates':
                this.handleGetTemplates();
                break;
            case 'getIPAssets':
                this.handleGetIPAssets();
                break;
            default:
                this.logger.warn(`Unknown webview command: ${message.command}`);
                break;
        }
    }
    /**
     * Send message to a webview
     * @param viewId Webview ID
     * @param message Message data
     */
    async sendMessageToWebview(viewId, message) {
        const webview = this.webviews.get(viewId);
        if (webview && webview.visible) {
            return webview.webview.postMessage(message);
        }
        return false;
    }
    /**
     * Handle template update event
     * @param data Event data
     */
    async handleTemplateUpdate(data) {
        await this.sendMessageToWebview('nsipLegal.templateExplorer', {
            command: 'templateUpdated',
            data
        });
    }
    /**
     * Handle document validation event
     * @param data Event data
     */
    async handleDocumentValidation(data) {
        await this.sendMessageToWebview('nsipLegal.documentValidator', {
            command: 'validationResults',
            data
        });
    }
    /**
     * Handle create template command
     * @param data Command data
     */
    async handleCreateTemplate(data) {
        this.eventBus.publish('template.create', data);
    }
    /**
     * Handle edit template command
     * @param data Command data
     */
    async handleEditTemplate(data) {
        this.eventBus.publish('template.edit', data);
    }
    /**
     * Handle validate document command
     * @param data Command data
     */
    async handleValidateDocument(data) {
        this.eventBus.publish('document.validate', data);
    }
    /**
     * Handle create IP asset command
     * @param data Command data
     */
    async handleCreateIPAsset(data) {
        this.eventBus.publish('ipAsset.create', data);
    }
    /**
     * Handle get templates command
     */
    async handleGetTemplates() {
        this.eventBus.publish('template.getAll', null);
    }
    /**
     * Handle get IP assets command
     */
    async handleGetIPAssets() {
        this.eventBus.publish('ipAsset.getAll', null);
    }
    /**
     * Get template explorer HTML
     * @param webview Webview
     * @returns HTML content
     */
    getTemplateExplorerHtml(webview) {
        // In a real implementation, we would load HTML files from disk
        // For this example, we'll use a simple template
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Template Explorer</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        padding: 20px;
                    }
                    
                    h1 {
                        font-size: 1.2rem;
                        margin-bottom: 20px;
                    }
                    
                    .template-list {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 10px;
                    }
                    
                    .template-card {
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 5px;
                        padding: 10px;
                        cursor: pointer;
                    }
                    
                    .template-card:hover {
                        background-color: var(--vscode-list-hoverBackground);
                    }
                    
                    .template-title {
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    
                    .template-description {
                        font-size: 0.9rem;
                        color: var(--vscode-descriptionForeground);
                    }
                    
                    .template-category {
                        display: inline-block;
                        font-size: 0.8rem;
                        background-color: var(--vscode-badge-background);
                        color: var(--vscode-badge-foreground);
                        padding: 2px 6px;
                        border-radius: 3px;
                        margin-top: 5px;
                    }
                    
                    .button {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 6px 12px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        margin-top: 20px;
                    }
                    
                    .button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                </style>
            </head>
            <body>
                <h1>Legal Document Templates</h1>
                
                <div class="template-list" id="templates">
                    <div class="template-card">
                        <div class="template-title">Non-Disclosure Agreement</div>
                        <div class="template-description">Standard NDA for protecting confidential information</div>
                        <div class="template-category">Contracts</div>
                    </div>
                    
                    <div class="template-card">
                        <div class="template-title">Privacy Policy</div>
                        <div class="template-description">GDPR and CCPA compliant privacy policy</div>
                        <div class="template-category">Privacy</div>
                    </div>
                    
                    <div class="template-card">
                        <div class="template-title">Employment Agreement</div>
                        <div class="template-description">Standard employment contract with IP protection</div>
                        <div class="template-category">Employment</div>
                    </div>
                </div>
                
                <button class="button" id="createTemplateBtn">Create New Template</button>
                
                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        
                        // Handle create template button
                        document.getElementById('createTemplateBtn').addEventListener('click', () => {
                            vscode.postMessage({
                                command: 'createTemplate',
                                data: {}
                            });
                        });
                        
                        // Handle template cards
                        document.querySelectorAll('.template-card').forEach(card => {
                            card.addEventListener('click', (e) => {
                                const title = e.currentTarget.querySelector('.template-title').textContent;
                                const category = e.currentTarget.querySelector('.template-category').textContent;
                                
                                vscode.postMessage({
                                    command: 'editTemplate',
                                    data: { title, category }
                                });
                            });
                        });
                        
                        // Request templates
                        vscode.postMessage({
                            command: 'getTemplates'
                        });
                        
                        // Handle messages from extension
                        window.addEventListener('message', event => {
                            const message = event.data;
                            
                            if (message.command === 'templateUpdated') {
                                // Update template list
                                // This would update the DOM in a real implementation
                                console.log('Template updated:', message.data);
                            }
                        });
                    }());
                </script>
            </body>
            </html>
        `;
    }
    /**
     * Get document validator HTML
     * @param webview Webview
     * @returns HTML content
     */
    getDocumentValidatorHtml(webview) {
        // In a real implementation, we would load HTML files from disk
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document Validator</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        padding: 20px;
                    }
                    
                    h1 {
                        font-size: 1.2rem;
                        margin-bottom: 20px;
                    }
                    
                    .form-group {
                        margin-bottom: 15px;
                    }
                    
                    label {
                        display: block;
                        margin-bottom: 5px;
                    }
                    
                    select, input {
                        width: 100%;
                        padding: 6px;
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 3px;
                    }
                    
                    .button {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 6px 12px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 0.9rem;
                    }
                    
                    .button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                    
                    .results {
                        margin-top: 20px;
                    }
                    
                    .result-item {
                        padding: 10px;
                        margin-bottom: 10px;
                        border-radius: 3px;
                    }
                    
                    .result-error {
                        background-color: var(--vscode-inputValidation-errorBackground);
                        border: 1px solid var(--vscode-inputValidation-errorBorder);
                    }
                    
                    .result-warning {
                        background-color: var(--vscode-inputValidation-warningBackground);
                        border: 1px solid var(--vscode-inputValidation-warningBorder);
                    }
                    
                    .result-info {
                        background-color: var(--vscode-inputValidation-infoBackground);
                        border: 1px solid var(--vscode-inputValidation-infoBorder);
                    }
                </style>
            </head>
            <body>
                <h1>Document Compliance Validator</h1>
                
                <div class="form-group">
                    <label for="docType">Document Type</label>
                    <select id="docType">
                        <option value="contract">Contract</option>
                        <option value="privacy-policy">Privacy Policy</option>
                        <option value="terms-of-service">Terms of Service</option>
                        <option value="data-processing-agreement">Data Processing Agreement</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="jurisdiction">Jurisdiction</label>
                    <select id="jurisdiction">
                        <option value="US">United States</option>
                        <option value="US-CA">California</option>
                        <option value="EU">European Union</option>
                        <option value="UK">United Kingdom</option>
                    </select>
                </div>
                
                <button class="button" id="validateBtn">Validate Active Document</button>
                
                <div class="results" id="results"></div>
                
                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        
                        document.getElementById('validateBtn').addEventListener('click', () => {
                            const docType = document.getElementById('docType').value;
                            const jurisdiction = document.getElementById('jurisdiction').value;
                            
                            vscode.postMessage({
                                command: 'validateDocument',
                                data: {
                                    documentType: docType,
                                    jurisdictions: [jurisdiction]
                                }
                            });
                        });
                        
                        // Handle messages from extension
                        window.addEventListener('message', event => {
                            const message = event.data;
                            
                            if (message.command === 'validationResults') {
                                displayValidationResults(message.data);
                            }
                        });
                        
                        function displayValidationResults(data) {
                            const resultsDiv = document.getElementById('results');
                            resultsDiv.innerHTML = '';
                            
                            if (!data || !data.results || data.results.length === 0) {
                                resultsDiv.innerHTML = '<p>No validation results</p>';
                                return;
                            }
                            
                            // Add summary
                            const summary = document.createElement('p');
                            summary.textContent = data.isValid 
                                ? 'Document is compliant with selected rules.' 
                                : 'Document has compliance issues that need to be addressed.';
                            resultsDiv.appendChild(summary);
                            
                            // Add results
                            data.results.forEach(result => {
                                const resultItem = document.createElement('div');
                                resultItem.className = \`result-item result-\${result.severity}\`;
                                
                                const title = document.createElement('div');
                                title.style.fontWeight = 'bold';
                                title.textContent = result.ruleName;
                                
                                const details = document.createElement('div');
                                details.textContent = result.details;
                                
                                resultItem.appendChild(title);
                                resultItem.appendChild(details);
                                resultsDiv.appendChild(resultItem);
                            });
                        }
                    }());
                </script>
            </body>
            </html>
        `;
    }
    /**
     * Get IP asset manager HTML
     * @param webview Webview
     * @returns HTML content
     */
    getIPAssetManagerHtml(webview) {
        // In a real implementation, we would load HTML files from disk
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>IP Asset Manager</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        padding: 20px;
                    }
                    
                    h1 {
                        font-size: 1.2rem;
                        margin-bottom: 20px;
                    }
                    
                    .asset-list {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 10px;
                    }
                    
                    .asset-card {
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 5px;
                        padding: 10px;
                        cursor: pointer;
                    }
                    
                    .asset-card:hover {
                        background-color: var(--vscode-list-hoverBackground);
                    }
                    
                    .asset-title {
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    
                    .asset-description {
                        font-size: 0.9rem;
                        color: var(--vscode-descriptionForeground);
                    }
                    
                    .asset-type {
                        display: inline-block;
                        font-size: 0.8rem;
                        background-color: var(--vscode-badge-background);
                        color: var(--vscode-badge-foreground);
                        padding: 2px 6px;
                        border-radius: 3px;
                        margin-top: 5px;
                    }
                    
                    .asset-status {
                        display: inline-block;
                        font-size: 0.8rem;
                        background-color: var(--vscode-badge-background);
                        color: var(--vscode-badge-foreground);
                        padding: 2px 6px;
                        border-radius: 3px;
                        margin-top: 5px;
                        margin-left: 5px;
                    }
                    
                    .button {
                        background-color: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 6px 12px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 0.9rem;
                        margin-top: 20px;
                    }
                    
                    .button:hover {
                        background-color: var(--vscode-button-hoverBackground);
                    }
                </style>
            </head>
            <body>
                <h1>Intellectual Property Assets</h1>
                
                <div class="asset-list" id="assets">
                    <div class="asset-card">
                        <div class="asset-title">Company Logo</div>
                        <div class="asset-description">Main corporate logo and brand identity</div>
                        <div class="asset-type">Trademark</div>
                        <div class="asset-status">Registered</div>
                    </div>
                    
                    <div class="asset-card">
                        <div class="asset-title">Document Analysis Algorithm</div>
                        <div class="asset-description">Core algorithm for legal document analysis</div>
                        <div class="asset-type">Patent</div>
                        <div class="asset-status">Pending</div>
                    </div>
                    
                    <div class="asset-card">
                        <div class="asset-title">Client Database Schema</div>
                        <div class="asset-description">Structure of client information database</div>
                        <div class="asset-type">Trade Secret</div>
                        <div class="asset-status">Protected</div>
                    </div>
                </div>
                
                <button class="button" id="createAssetBtn">Track New IP Asset</button>
                
                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        
                        // Handle create asset button
                        document.getElementById('createAssetBtn').addEventListener('click', () => {
                            vscode.postMessage({
                                command: 'createIPAsset',
                                data: {}
                            });
                        });
                        
                        // Handle asset cards
                        document.querySelectorAll('.asset-card').forEach(card => {
                            card.addEventListener('click', (e) => {
                                const title = e.currentTarget.querySelector('.asset-title').textContent;
                                const type = e.currentTarget.querySelector('.asset-type').textContent;
                                
                                vscode.postMessage({
                                    command: 'editIPAsset',
                                    data: { title, type }
                                });
                            });
                        });
                        
                        // Request assets
                        vscode.postMessage({
                            command: 'getIPAssets'
                        });
                        
                        // Handle messages from extension
                        window.addEventListener('message', event => {
                            const message = event.data;
                            
                            if (message.command === 'ipAssetsUpdated') {
                                // Update asset list
                                // This would update the DOM in a real implementation
                                console.log('IP assets updated:', message.data);
                            }
                        });
                    }());
                </script>
            </body>
            </html>
        `;
    }
    /**
     * Get default HTML
     * @param webview Webview
     * @returns HTML content
     */
    getDefaultHtml(webview) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>NSIP Legal IDE</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                    }
                    
                    h1 {
                        font-size: 1.5rem;
                        margin-bottom: 20px;
                    }
                    
                    p {
                        text-align: center;
                        max-width: 500px;
                    }
                </style>
            </head>
            <body>
                <h1>NSIP Legal IDE</h1>
                <p>Intelligent legal document creation and management</p>
            </body>
            </html>
        `;
    }
    /**
     * Dispose webview provider
     */
    dispose() {
        // Dispose all disposables
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        // Clear maps
        this.webviews.clear();
        this.disposables = [];
    }
}
exports.WebViewProvider = WebViewProvider;
//# sourceMappingURL=webviewProvider.js.map