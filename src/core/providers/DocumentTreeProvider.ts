/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';

export class DocumentTreeProvider implements vscode.TreeDataProvider<DocumentNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<DocumentNode | undefined | null | void> = new vscode.EventEmitter<DocumentNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DocumentNode | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string | undefined) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DocumentNode): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: DocumentNode): Promise<DocumentNode[]> {
        if (!this.workspaceRoot) {
            return Promise.resolve([]);
        }

        if (!element) {
            return this.getLegalDocuments();
        }

        return element.children || [];
    }

    private async getLegalDocuments(): Promise<DocumentNode[]> {
        const legalDocuments: DocumentNode[] = [];

        if (this.workspaceRoot) {
            // Get all legal documents in the workspace
            const pattern = new vscode.RelativePattern(this.workspaceRoot, '**/*.{md,legal}');
            const files = await vscode.workspace.findFiles(pattern);

            for (const file of files) {
                const document = await this.analyzeDocument(file);
                if (document) {
                    legalDocuments.push(document);
                }
            }
        }

        return legalDocuments;
    }

    private async analyzeDocument(uri: vscode.Uri): Promise<DocumentNode | undefined> {
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            const content = document.getText();

            // Basic document type detection
            let documentType = 'Unknown';
            if (content.toLowerCase().includes('agreement')) {
                documentType = 'Agreement';
            } else if (content.toLowerCase().includes('contract')) {
                documentType = 'Contract';
            } else if (content.toLowerCase().includes('policy')) {
                documentType = 'Policy';
            }

            return new DocumentNode(
                document.fileName,
                documentType,
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'nsip.openDocument',
                    title: 'Open Document',
                    arguments: [uri]
                }
            );
        } catch (error) {
            console.error('Error analyzing document:', error);
            return undefined;
        }
    }
}

class DocumentNode extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private type: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly children?: DocumentNode[]
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label} (${this.type})`;
        this.description = this.type;
    }

    iconPath = {
        light: vscode.Uri.file('resources/light/document.svg'),
        dark: vscode.Uri.file('resources/dark/document.svg')
    };

    contextValue = 'document';
}
