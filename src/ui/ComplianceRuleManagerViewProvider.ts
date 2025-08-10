/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { ComplianceRule, RiskLevel } from '../core/models/ComplianceTypes';

type ComplianceRuleCommand = 
    | { command: 'addRule'; rule: ComplianceRule }
    | { command: 'editRule'; rule: ComplianceRule; index: number }
    | { command: 'deleteRule'; index: number }
    | { command: 'exportRules' }
    | { command: 'importRules'; rules: ComplianceRule[] }
    | { command: 'showError'; message: string };

interface ComplianceRuleValidation {
    isValid: boolean;
    errors: string[];
}

export class ComplianceRuleManagerViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    private rules: ComplianceRule[] = [{
        name: 'Data Protection Compliance',
        description: 'Ensure proper handling of personal data in accordance with GDPR and other privacy laws.',
        riskLevel: 'High' as RiskLevel,
        recommendation: 'Implement data encryption and secure storage protocols.',
        jurisdictions: ['EU', 'Global']
    }];

    constructor(private readonly context: vscode.ExtensionContext) {
        const savedRules = this.context.globalState.get<ComplianceRule[]>('complianceRules');
        if (savedRules) {
            this.rules = savedRules;
        }
    }

    resolveWebviewView = (webviewView: vscode.WebviewView): void => {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };

        webviewView.webview.onDidReceiveMessage(this._handleMessage);
        this._updateWebview();
    }

    private validateRule(rule: ComplianceRule): ComplianceRuleValidation {
        const errors: string[] = [];
        
        if (!rule.name?.trim()) {
            errors.push('Name is required');
        }
        if (!rule.description?.trim()) {
            errors.push('Description is required');
        }
        if (!rule.riskLevel) {
            errors.push('Risk level is required');
        }
        if (!rule.recommendation?.trim()) {
            errors.push('Recommendation is required');
        }
        if (!rule.jurisdictions?.length) {
            errors.push('At least one jurisdiction is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private _handleMessage = (message: ComplianceRuleCommand): void => {
        switch (message.command) {
            case 'addRule': {
                const validation = this.validateRule(message.rule);
                if (!validation.isValid) {
                    void vscode.window.showErrorMessage(
                        `Invalid rule: ${validation.errors.join(', ')}`
                    );
                    return;
                }
                this.rules.push(message.rule);
                this._persistRules();
                this._updateWebview();
                void vscode.window.showInformationMessage('Rule added successfully');
                break;
            }
            case 'editRule': {
                if (!this.rules[message.index]) {
                    void vscode.window.showErrorMessage('Rule not found');
                    return;
                }
                const validation = this.validateRule(message.rule);
                if (!validation.isValid) {
                    void vscode.window.showErrorMessage(
                        `Invalid rule: ${validation.errors.join(', ')}`
                    );
                    return;
                }
                this.rules[message.index] = message.rule;
                this._persistRules();
                this._updateWebview();
                void vscode.window.showInformationMessage('Rule updated successfully');
                break;
            }
            case 'deleteRule': {
                if (!this.rules[message.index]) {
                    void vscode.window.showErrorMessage('Rule not found');
                    return;
                }
                this.rules.splice(message.index, 1);
                this._persistRules();
                this._updateWebview();
                void vscode.window.showInformationMessage('Rule deleted successfully');
                break;
            }
            case 'exportRules':
                void this._exportRules();
                break;
            case 'importRules': {
                const invalidRules = message.rules.filter(
                    rule => !this.validateRule(rule).isValid
                );
                if (invalidRules.length > 0) {
                    void vscode.window.showErrorMessage(
                        `Found ${invalidRules.length} invalid rules in import. Please check the format.`
                    );
                    return;
                }
                this.rules = message.rules;
                this._persistRules();
                this._updateWebview();
                void vscode.window.showInformationMessage('Rules imported successfully');
                break;
            }
            case 'showError':
                void vscode.window.showErrorMessage(message.message);
                break;
        }
    }

    private _exportRules = async (): Promise<void> => {
        const filePath = await vscode.window.showSaveDialog({
            filters: {
                'JSON files': ['json']
            }
        });
        if (filePath) {
            try {
                await vscode.workspace.fs.writeFile(
                    filePath,
                    new Uint8Array(Buffer.from(JSON.stringify(this.rules, null, 2)))
                );
                void vscode.window.showInformationMessage('Rules exported successfully');
            } catch (error) {
                void vscode.window.showErrorMessage('Failed to export rules');
            }
        }
    }

    private _persistRules = (): void => {
        void this.context.globalState.update('complianceRules', this.rules);
    }

    private _getNonce = (): string => {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private _updateWebview = (): void => {
        if (!this._view) {
            return;
        }

        const webview = this._view.webview;
        const nonce = this._getNonce();

        this._view.webview.html = this._getWebviewContent(webview, nonce);
    }

    private _generateRulesHtml = (): string => {
        if (this.rules.length === 0) {
            return `
                <p class="no-rules" role="status">
                    No compliance rules found. Click "Add Rule" to create one.
                </p>
            `;
        }

        return this.rules.map((rule, idx) => 
            `<article 
                class="rule-item" 
                role="region" 
                aria-labelledby="rule-${idx}-name"
                data-rule-index="${idx}"
            >
                <h2 id="rule-${idx}-name" class="name">${this._escapeHtml(rule.name)}</h2>
                <div class="description" aria-label="Description">
                    ${this._escapeHtml(rule.description)}
                </div>
                <div class="risk" aria-label="Risk Level">
                    Risk Level: <span class="risk-level ${rule.riskLevel.toLowerCase()}">
                        ${this._escapeHtml(rule.riskLevel)}
                    </span>
                </div>
                <div class="recommendation" aria-label="Recommendation">
                    <strong>Recommendation:</strong> ${this._escapeHtml(rule.recommendation)}
                </div>
                <div class="jurisdictions" aria-label="Jurisdictions">
                    <strong>Jurisdictions:</strong> ${rule.jurisdictions && rule.jurisdictions.length > 0 ? 
                        this._escapeHtml(rule.jurisdictions.join(', ')) : 
                        'None'
                    }
                </div>
                <div class="rule-actions" role="toolbar" aria-label="Rule actions">
                    <button 
                        onclick="showEditForm(${idx})"
                        class="edit-btn"
                        aria-label="Edit ${this._escapeHtml(rule.name)}"
                    >
                        Edit
                    </button>
                    <button 
                        onclick="deleteRule(${idx})"
                        class="delete-btn"
                        aria-label="Delete ${this._escapeHtml(rule.name)}"
                    >
                        Delete
                    </button>
                </div>
            </article>`
        ).join('');
    }

    private _escapeHtml = (unsafe: string): string => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    private _getWebviewContent = (webview: vscode.Webview, nonce: string): string => {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>Compliance Rule Manager</title>
    <style>
        :root {
            --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            --font-size: 13px;
            --primary-color: var(--vscode-button-background);
            --primary-hover-color: var(--vscode-button-hoverBackground);
            --danger-color: var(--vscode-errorForeground);
            --text-color: var(--vscode-editor-foreground);
            --bg-color: var(--vscode-editor-background);
            --border-color: var(--vscode-widget-border);
            --input-bg: var(--vscode-input-background);
            --input-fg: var(--vscode-input-foreground);
            --border-radius: 4px;
            --spacing-xs: 4px;
            --spacing-sm: 8px;
            --spacing-md: 16px;
            --spacing-lg: 24px;
            --transition-duration: 0.2s;
        }

        body {
            font-family: var(--font-family);
            font-size: var(--font-size);
            color: var(--text-color);
            background-color: var(--bg-color);
            padding: var(--spacing-md);
            line-height: 1.5;
        }

        .rule-item {
            margin-bottom: var(--spacing-md);
            padding: var(--spacing-md);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            transition: box-shadow var(--transition-duration);
        }

        .rule-item:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .name {
            font-weight: 600;
            margin-bottom: var(--spacing-xs);
            font-size: 1.1em;
        }

        .description, .risk, .recommendation, .jurisdictions {
            margin-bottom: var(--spacing-sm);
        }

        .actions {
            margin-bottom: var(--spacing-lg);
            display: flex;
            gap: var(--spacing-sm);
        }

        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: background-color var(--transition-duration);
            font-family: inherit;
            font-size: inherit;
        }

        button:hover {
            background-color: var(--primary-hover-color);
        }

        button:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }

        .delete-btn {
            background-color: var(--danger-color);
        }

        .form-section {
            margin-top: var(--spacing-lg);
            padding: var(--spacing-md);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            background-color: var(--input-bg);
        }

        input, textarea, select {
            width: 100%;
            margin-bottom: var(--spacing-sm);
            padding: var(--spacing-sm);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            background-color: var(--input-bg);
            color: var(--input-fg);
            font-family: inherit;
            font-size: inherit;
        }

        input:focus, textarea:focus, select:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: -1px;
        }

        textarea {
            min-height: 100px;
            resize: vertical;
        }

        label {
            display: block;
            margin-bottom: var(--spacing-xs);
            font-weight: 500;
        }

        .form-group {
            margin-bottom: var(--spacing-md);
        }

        .error-message {
            display: none;
            color: var(--danger-color);
            font-size: 0.9em;
            margin-top: var(--spacing-xs);
        }

        [aria-invalid="true"] {
            border-color: var(--danger-color);
        }

        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--primary-color);
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
        }

        .loading {
            opacity: 0.7;
            pointer-events: none;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        button.loading::after {
            content: '';
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid var(--primary-color);
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
            margin-left: var(--spacing-sm);
        }

        .form-actions {
            display: flex;
            gap: var(--spacing-sm);
            margin-top: var(--spacing-md);
        }

        .submit-btn {
            flex: 1;
        }

        .cancel-btn {
            background-color: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-color);
        }

        .cancel-btn:hover {
            background-color: var(--border-color);
        }

        .no-rules {
            text-align: center;
            padding: var(--spacing-lg);
            color: var(--text-color);
            border: 1px dashed var(--border-color);
            border-radius: var(--border-radius);
        }

        .risk-level {
            display: inline-block;
            padding: 2px 8px;
            border-radius: var(--border-radius);
            font-weight: 500;
        }

        .risk-level.high {
            background-color: var(--danger-color);
            color: white;
        }

        .risk-level.medium {
            background-color: var(--vscode-warningForeground);
            color: black;
        }

        .risk-level.low {
            background-color: var(--vscode-successForeground);
            color: white;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    </style>
</head>
<body>
    <main>
        <h1>Compliance Rule Manager</h1>
        
        <div class="actions" role="toolbar" aria-label="Rule management actions">
            <button id="addRuleBtn" aria-label="Add new rule">
                <span aria-hidden="true">+</span> Add Rule
            </button>
            <button id="exportBtn" aria-label="Export rules to JSON">
                Export Rules
            </button>
            <button id="importBtn" aria-label="Import rules from JSON">
                Import Rules
            </button>
            <input type="file" 
                id="importInput" 
                style="display: none;" 
                accept=".json" 
                aria-label="Choose JSON file to import"
            >
        </div>

        <section id="rules" aria-label="List of compliance rules">
            ${this._generateRulesHtml()}
        </section>

        <section id="formContainer" 
            style="display:none;" 
            role="form" 
            aria-labelledby="formTitle"
        >
        </section>

        <div id="loadingOverlay" class="loading-overlay" style="display: none;">
            <div class="loading-spinner" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </main>
    <script nonce="${nonce}">
        (function() {
            const vscode = acquireVsCodeApi();
            const rulesData = ${JSON.stringify(this.rules)};

            // Event Listeners
            document.getElementById('addRuleBtn').addEventListener('click', showAddForm);
            document.getElementById('exportBtn').addEventListener('click', () => {
                vscode.postMessage({ command: 'exportRules' });
            });
            document.getElementById('importBtn').addEventListener('click', () => {
                document.getElementById('importInput').click();
            });
            document.getElementById('importInput').addEventListener('change', handleImport);

            function handleImport(event) {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const rules = JSON.parse(e.target.result);
                        vscode.postMessage({
                            command: 'importRules',
                            rules: rules
                        });
                    } catch (error) {
                        vscode.postMessage({
                            command: 'showError',
                            message: 'Invalid rules file format'
                        });
                    }
                };
                reader.readAsText(file);
            }

            function showAddForm() {
                const formContainer = document.getElementById('formContainer');
                formContainer.style.display = 'block';
                formContainer.innerHTML = \`
                    <div class="form-section">
                        <h3 id="formTitle">Add New Rule</h3>
                        <form id="ruleForm" novalidate>
                            <div class="form-group">
                                <label for="ruleName">Name:</label>
                                <input 
                                    type="text" 
                                    id="ruleName" 
                                    name="name"
                                    required 
                                    aria-required="true"
                                    maxlength="100"
                                />
                                <div class="error-message" id="nameError"></div>
                            </div>

                            <div class="form-group">
                                <label for="ruleDescription">Description:</label>
                                <textarea 
                                    id="ruleDescription" 
                                    name="description"
                                    required 
                                    aria-required="true"
                                ></textarea>
                                <div class="error-message" id="descriptionError"></div>
                            </div>

                            <div class="form-group">
                                <label for="ruleRiskLevel">Risk Level:</label>
                                <select 
                                    id="ruleRiskLevel" 
                                    name="riskLevel"
                                    required 
                                    aria-required="true"
                                >
                                    <option value="">Select risk level...</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                                <div class="error-message" id="riskLevelError"></div>
                            </div>

                            <div class="form-group">
                                <label for="ruleRecommendation">Recommendation:</label>
                                <textarea 
                                    id="ruleRecommendation" 
                                    name="recommendation"
                                    required 
                                    aria-required="true"
                                ></textarea>
                                <div class="error-message" id="recommendationError"></div>
                            </div>

                            <div class="form-group">
                                <label for="ruleJurisdictions">
                                    Jurisdictions (comma-separated):
                                </label>
                                <input 
                                    type="text" 
                                    id="ruleJurisdictions" 
                                    name="jurisdictions"
                                    required 
                                    aria-required="true"
                                    placeholder="e.g., US, EU, Global"
                                />
                                <div class="error-message" id="jurisdictionsError"></div>
                            </div>

                            <div class="form-actions">
                                <button 
                                    type="submit" 
                                    class="submit-btn"
                                    onclick="submitRule(event)"
                                >
                                    Submit
                                </button>
                                <button 
                                    type="button" 
                                    class="cancel-btn"
                                    onclick="cancelForm()"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                \`;
            }

            function showEditForm(idx) {
                const rule = rulesData[idx];
                const formContainer = document.getElementById('formContainer');
                formContainer.style.display = 'block';
                formContainer.innerHTML = \`
                    <div class="form-section">
                        <h3>Edit Rule</h3>
                        <p><label>Name:</label><br><input type="text" id="ruleName" value="\${rule.name}" /></p>
                        <p><label>Description:</label><br><textarea id="ruleDescription">\${rule.description}</textarea></p>
                        <p>
                            <label>Risk Level:</label><br>
                            <select id="ruleRiskLevel">
                                <option value="Low" \${rule.riskLevel === 'Low' ? 'selected' : ''}>Low</option>
                                <option value="Medium" \${rule.riskLevel === 'Medium' ? 'selected' : ''}>Medium</option>
                                <option value="High" \${rule.riskLevel === 'High' ? 'selected' : ''}>High</option>
                            </select>
                        </p>
                        <p><label>Recommendation:</label><br><textarea id="ruleRecommendation">\${rule.recommendation}</textarea></p>
                        <p><label>Jurisdictions (comma-separated):</label><br><input type="text" id="ruleJurisdictions" value="\${rule.jurisdictions ? rule.jurisdictions.join(', ') : ''}" /></p>
                        <button onclick="submitEditRule(\${idx})">Update</button>
                        <button onclick="cancelForm()">Cancel</button>
                    </div>
                \`;
            }

            function cancelForm() {
                document.getElementById('formContainer').style.display = 'none';
            }

            function validateForm() {
                const errors = {};
                const form = document.getElementById('ruleForm');
                const fields = ['name', 'description', 'riskLevel', 'recommendation', 'jurisdictions'];
                
                fields.forEach(field => {
                    const element = document.getElementById('rule' + field.charAt(0).toUpperCase() + field.slice(1));
                    const errorElement = document.getElementById(field + 'Error');
                    const value = element.value.trim();
                    
                    if (!value) {
                        errors[field] = 'This field is required';
                        element.setAttribute('aria-invalid', 'true');
                        errorElement.textContent = 'This field is required';
                        errorElement.style.display = 'block';
                    } else {
                        element.setAttribute('aria-invalid', 'false');
                        errorElement.style.display = 'none';
                    }
                });

                return Object.keys(errors).length === 0;
            }

            function setLoading(isLoading) {
                const submitBtn = document.querySelector('.submit-btn');
                const loadingOverlay = document.getElementById('loadingOverlay');
                
                if (isLoading) {
                    submitBtn.disabled = true;
                    submitBtn.classList.add('loading');
                    loadingOverlay.style.display = 'flex';
                } else {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                    loadingOverlay.style.display = 'none';
                }
            }

            function getRuleFromForm() {
                const jurisdictions = document.getElementById('ruleJurisdictions').value
                    .split(',')
                    .map(j => j.trim())
                    .filter(j => j);

                return {
                    name: document.getElementById('ruleName').value.trim(),
                    description: document.getElementById('ruleDescription').value.trim(),
                    riskLevel: document.getElementById('ruleRiskLevel').value,
                    recommendation: document.getElementById('ruleRecommendation').value.trim(),
                    jurisdictions
                };
            }

            async function submitRule(event) {
                event.preventDefault();
                
                if (!validateForm()) {
                    return;
                }

                setLoading(true);
                const rule = getRuleFromForm();
                
                try {
                    vscode.postMessage({
                        command: 'addRule',
                        rule: rule
                    });
                } finally {
                    setLoading(false);
                    cancelForm();
                }
            }

            async function submitEditRule(idx) {
                if (!validateForm()) {
                    return;
                }

                setLoading(true);
                const rule = getRuleFromForm();
                
                try {
                    vscode.postMessage({
                        command: 'editRule',
                        index: idx,
                        rule: rule
                    });
                } finally {
                    setLoading(false);
                    cancelForm();
                }
            }

            function deleteRule(idx) {
                if (confirm('Are you sure you want to delete this rule?')) {
                    vscode.postMessage({
                        command: 'deleteRule',
                        index: idx
                    });
                }
            }

            // Make functions globally available
            window.showAddForm = showAddForm;
            window.showEditForm = showEditForm;
            window.submitRule = submitRule;
            window.submitEditRule = submitEditRule;
            window.cancelForm = cancelForm;
            window.deleteRule = deleteRule;
        })();
    </script>
</body>
</html>`;
    }
}
