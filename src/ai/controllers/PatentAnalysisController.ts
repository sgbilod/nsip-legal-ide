/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { PatentAnalysisService } from '../services/PatentAnalysisService';
import { PatentClaim } from '../models/PatentClaim';

export class PatentAnalysisController {
    private patentAnalysisService: PatentAnalysisService;

    constructor(context: vscode.ExtensionContext) {
        this.patentAnalysisService = new PatentAnalysisService(context);
        this.registerCommands(context);
    }

    private registerCommands(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.commands.registerCommand('nsip.analyzeClaims', async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const text = editor.document.getText();
                        const claims = await this.patentAnalysisService.analyzeClaims(text);
                        await this.displayAnalysisResults(claims);
                    }
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to analyze claims');
                }
            })
        );
    }

    private async displayAnalysisResults(claims: PatentClaim[]): Promise<void> {
        // Create a new webview to display results
        const panel = vscode.window.createWebviewPanel(
            'patentAnalysis',
            'Patent Analysis Results',
            vscode.ViewColumn.Two,
            {
                enableScripts: true
            }
        );

        panel.webview.html = this.getResultsHtml(claims);
    }

    private getResultsHtml(claims: PatentClaim[]): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Patent Analysis Results</title>
                    <style>
                        body { padding: 15px; }
                        .claim { margin-bottom: 20px; }
                        .analysis { margin-left: 20px; }
                    </style>
                </head>
                <body>
                    <h1>Analysis Results</h1>
                    ${claims.map(claim => `
                        <div class="claim">
                            <h3>Claim ${claim.id}</h3>
                            <p>${claim.text}</p>
                            <div class="analysis">
                                <p>Type: ${claim.type}</p>
                                <p>Novelty Score: ${claim.analysis.novelty}</p>
                                <p>Clarity Score: ${claim.analysis.clarity}</p>
                                <p>Support Score: ${claim.analysis.support}</p>
                            </div>
                        </div>
                    `).join('')}
                </body>
            </html>
        `;
    }
}
