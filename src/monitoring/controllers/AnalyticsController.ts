/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { AnalyticsService } from '../services/AnalyticsService';
import { AnalyticsDashboard } from '../models/AnalyticsDashboard';

export class AnalyticsController {
    private analyticsService: AnalyticsService;
    private dashboardPanel: vscode.WebviewPanel | undefined;

    constructor(context: vscode.ExtensionContext) {
        this.analyticsService = new AnalyticsService(context);
        this.registerCommands(context);
    }

    private registerCommands(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.commands.registerCommand('nsip.showDashboard', async () => {
                try {
                    await this.analyticsService.initializeDashboard();
                    await this.showDashboard();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to show analytics dashboard');
                }
            })
        );
    }

    private async showDashboard(): Promise<void> {
        if (this.dashboardPanel) {
            this.dashboardPanel.reveal();
            return;
        }

        this.dashboardPanel = vscode.window.createWebviewPanel(
            'analyticsDashboard',
            'NSIP Analytics Dashboard',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.dashboardPanel.onDidDispose(() => {
            this.dashboardPanel = undefined;
        });

        // Initial render
        await this.updateDashboardContent();
    }

    private async updateDashboardContent(): Promise<void> {
        if (this.dashboardPanel) {
            this.dashboardPanel.webview.html = await this.getDashboardHtml();
        }
    }

    private async getDashboardHtml(): Promise<string> {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Analytics Dashboard</title>
                    <style>
                        body { padding: 15px; }
                        .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                        .metric-card { 
                            padding: 15px; 
                            border: 1px solid #ccc; 
                            border-radius: 4px;
                        }
                        .charts { margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <h1>Analytics Dashboard</h1>
                    <div class="metrics">
                        <div class="metric-card">
                            <h3>Document Count</h3>
                            <p>0</p>
                        </div>
                        <div class="metric-card">
                            <h3>Active Collaborators</h3>
                            <p>0</p>
                        </div>
                        <div class="metric-card">
                            <h3>Average Response Time</h3>
                            <p>0ms</p>
                        </div>
                        <div class="metric-card">
                            <h3>Completion Rate</h3>
                            <p>0%</p>
                        </div>
                    </div>
                    <div class="charts">
                        <!-- TODO: Add chart visualizations -->
                    </div>
                </body>
            </html>
        `;
    }
}
