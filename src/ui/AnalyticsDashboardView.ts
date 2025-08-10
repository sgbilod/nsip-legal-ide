/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';

export class AnalyticsDashboardView {
    private panel: vscode.WebviewPanel | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {}

    public showDashboard(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'analyticsDashboard',
            'Analytics Dashboard',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        this.updateDashboardContent();
    }

    private updateDashboardContent(): void {
        if (this.panel) {
            this.panel.webview.html = this.getDashboardHtml();
        }
    }

    private getDashboardHtml(): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Analytics Dashboard</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .metric { margin-bottom: 20px; }
                        .metric h3 { margin: 0; }
                        .metric p { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <h1>Analytics Dashboard</h1>
                    <div class="metric">
                        <h3>Document Count</h3>
                        <p>100</p>
                    </div>
                    <div class="metric">
                        <h3>Active Collaborators</h3>
                        <p>5</p>
                    </div>
                    <div class="metric">
                        <h3>Average Response Time</h3>
                        <p>200ms</p>
                    </div>
                    <div class="metric">
                        <h3>Completion Rate</h3>
                        <p>85%</p>
                    </div>
                </body>
            </html>
        `;
    }
}
