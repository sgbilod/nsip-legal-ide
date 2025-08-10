/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { ContractTemplate } from '../models/ContractTemplate';

export class TemplateHistoryViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getHtmlContent();
    }

    private getHtmlContent(): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Template History</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 10px; }
                        .history-item { margin-bottom: 15px; }
                        .version { font-weight: bold; }
                        .changes { margin-left: 10px; }
                    </style>
                </head>
                <body>
                    <h1>Template History</h1>
                    <div id="history">
                        <!-- History items will be dynamically loaded here -->
                    </div>
                    <script>
                        const vscode = acquireVsCodeApi();
                        window.addEventListener('message', event => {
                            const history = event.data.history;
                            const historyContainer = document.getElementById('history');
                            historyContainer.innerHTML = history.map(item => \`
                                <div class="history-item">
                                    <span class="version">Version: \${item.version}</span>
                                    <span class="changes">Changes: \${item.changes}</span>
                                    <span class="date">Modified Date: \${new Date(item.modifiedDate).toLocaleString()}</span>
                                </div>
                            \`).join('');
                        });
                    </script>
                </body>
            </html>
        `;
    }

    public updateHistory(history: ContractTemplate['history']): void {
        if (this._view) {
            this._view.webview.postMessage({ history });
        }
    }
}
