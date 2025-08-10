/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { DocumentAnalyzerService } from '../services/DocumentAnalyzerService';
import { ComplianceAnalyzerService } from '../services/ComplianceAnalyzerService';
import { DocumentGeneratorService } from '../services/DocumentGeneratorService';
import { TemplateManagerService } from '../services/TemplateManagerService';

export class DocumentCommandHandler {
    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly documentAnalyzer: DocumentAnalyzerService,
        private readonly complianceAnalyzer: ComplianceAnalyzerService,
        private readonly documentGenerator: DocumentGeneratorService,
        private readonly templateManager: TemplateManagerService
    ) {
        this.registerCommands();
    }

    private registerCommands(): void {
        // Document analysis command
        this.context.subscriptions.push(
            vscode.commands.registerCommand('nsip.analyzeDocument', async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        vscode.window.showWarningMessage('No active document to analyze');
                        return;
                    }

                    const analysis = await this.documentAnalyzer.analyzeDocument(editor.document);
                    await this.showAnalysisResults(analysis);
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to analyze document');
                }
            })
        );

        // Compliance check command
        this.context.subscriptions.push(
            vscode.commands.registerCommand('nsip.validateCompliance', async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (!editor) {
                        vscode.window.showWarningMessage('No active document to validate');
                        return;
                    }

                    const issues = await this.complianceAnalyzer.analyzeCompliance(editor.document);
                    await this.showComplianceIssues(issues);
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to validate compliance');
                }
            })
        );

        // Document generation command
        this.context.subscriptions.push(
            vscode.commands.registerCommand('nsip.createDocument', async () => {
                try {
                    const template = await this.selectTemplate();
                    if (!template) {
                        return;
                    }

                    const variables = await this.collectVariables(template);
                    if (!variables) {
                        return;
                    }

                    const content = await this.documentGenerator.generateDocument(template, variables);
                    await this.createNewDocument(content);
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to create document');
                }
            })
        );
    }

    private async showAnalysisResults(analysis: any): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'documentAnalysis',
            'Document Analysis Results',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getAnalysisHtml(analysis);
    }

    private async showComplianceIssues(issues: any[]): Promise<void> {
        if (issues.length === 0) {
            vscode.window.showInformationMessage('No compliance issues found');
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'complianceIssues',
            'Compliance Issues',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getComplianceHtml(issues);
    }

    private async selectTemplate(): Promise<any> {
        const templates = await this.templateManager.getAllTemplates();
        const items = templates.map(t => ({
            label: t.name,
            description: t.description,
            template: t
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a document template'
        });

        return selected?.template;
    }

    private async collectVariables(template: any): Promise<Record<string, any> | undefined> {
        const variables: Record<string, any> = {};

        for (const variable of template.variables) {
            const value = await vscode.window.showInputBox({
                prompt: variable.description,
                placeHolder: `Enter ${variable.name}`,
                validateInput: (value) => {
                    if (variable.required && !value) {
                        return 'This field is required';
                    }
                    return null;
                }
            });

            if (value === undefined) {
                return undefined;
            }

            variables[variable.name] = value;
        }

        return variables;
    }

    private async createNewDocument(content: string): Promise<void> {
        const document = await vscode.workspace.openTextDocument({
            content,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(document);
    }

    private getAnalysisHtml(analysis: any): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Document Analysis</title>
                    <style>
                        body { padding: 15px; }
                        .section { margin-bottom: 20px; }
                        .entity { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <h1>Document Analysis Results</h1>
                    
                    <div class="section">
                        <h2>Identified Clauses</h2>
                        ${analysis.clauses.map((clause: string) => `
                            <div class="clause">${clause}</div>
                        `).join('')}
                    </div>

                    <div class="section">
                        <h2>Identified Entities</h2>
                        ${analysis.entities.map((entity: string) => `
                            <div class="entity">${entity}</div>
                        `).join('')}
                    </div>
                </body>
            </html>
        `;
    }

    private getComplianceHtml(issues: any[]): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Compliance Issues</title>
                    <style>
                        body { padding: 15px; }
                        .issue { margin-bottom: 15px; }
                        .high { color: #d73a49; }
                        .medium { color: #e36209; }
                        .low { color: #032f62; }
                    </style>
                </head>
                <body>
                    <h1>Compliance Issues</h1>
                    
                    ${issues.map(issue => `
                        <div class="issue ${issue.riskLevel.toLowerCase()}">
                            <h3>${issue.rule}</h3>
                            <p>${issue.description}</p>
                            <p><strong>Recommendation:</strong> ${issue.recommendation}</p>
                        </div>
                    `).join('')}
                </body>
            </html>
        `;
    }
}
