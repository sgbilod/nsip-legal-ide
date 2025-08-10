import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { IService } from '../core/interfaces';
import { Logger } from '../core/logger';

/**
 * Interface for document explorer service
 */
export interface IDocumentExplorer extends IService {
    /**
     * Refresh the document explorer
     */
    refresh(): void;
    
    /**
     * Add a workspace folder to the document explorer
     * @param folderUri URI of the folder to add
     */
    addWorkspaceFolder(folderUri: vscode.Uri): void;
    
    /**
     * Remove a workspace folder from the document explorer
     * @param folderUri URI of the folder to remove
     */
    removeWorkspaceFolder(folderUri: vscode.Uri): void;
}

/**
 * Implementation of a document explorer view using a VS Code TreeView
 */
export class DocumentExplorer implements IDocumentExplorer {
    private treeView: vscode.TreeView<DocumentTreeItem> | undefined;
    private treeDataProvider: DocumentTreeDataProvider;
    private logger: Logger;
    private workspaceFolders: vscode.Uri[] = [];
    
    constructor(logger: Logger) {
        this.logger = logger;
        this.treeDataProvider = new DocumentTreeDataProvider(this.logger);
    }
    
    public async initialize(): Promise<void> {
        // Create the tree view
        this.treeView = vscode.window.createTreeView('nsipDocumentExplorer', {
            treeDataProvider: this.treeDataProvider,
            showCollapseAll: true
        });
        
        // Add initial workspace folders
        if (vscode.workspace.workspaceFolders) {
            vscode.workspace.workspaceFolders.forEach(folder => {
                this.addWorkspaceFolder(folder.uri);
            });
        }
        
        // Register workspace folder change events
        vscode.workspace.onDidChangeWorkspaceFolders(e => {
            e.added.forEach(folder => this.addWorkspaceFolder(folder.uri));
            e.removed.forEach(folder => this.removeWorkspaceFolder(folder.uri));
        });
        
        this.logger.debug('DocumentExplorer initialized');
    }
    
    public dispose(): void {
        if (this.treeView) {
            this.treeView.dispose();
        }
        this.logger.debug('DocumentExplorer disposed');
    }
    
    public refresh(): void {
        this.treeDataProvider.refresh();
    }
    
    public addWorkspaceFolder(folderUri: vscode.Uri): void {
        if (!this.workspaceFolders.some(f => f.fsPath === folderUri.fsPath)) {
            this.workspaceFolders.push(folderUri);
            this.treeDataProvider.setWorkspaceFolders(this.workspaceFolders);
            this.refresh();
        }
    }
    
    public removeWorkspaceFolder(folderUri: vscode.Uri): void {
        this.workspaceFolders = this.workspaceFolders.filter(f => f.fsPath !== folderUri.fsPath);
        this.treeDataProvider.setWorkspaceFolders(this.workspaceFolders);
        this.refresh();
    }
}

/**
 * Types of document explorer items
 */
enum DocumentItemType {
    Folder,
    Document,
    Template
}

/**
 * Tree item representing a document or folder
 */
class DocumentTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly path: string,
        public readonly type: DocumentItemType,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        
        // Set icon based on type
        switch (type) {
            case DocumentItemType.Folder:
                this.iconPath = new vscode.ThemeIcon('folder');
                break;
            case DocumentItemType.Document:
                this.iconPath = new vscode.ThemeIcon('file-text');
                break;
            case DocumentItemType.Template:
                this.iconPath = new vscode.ThemeIcon('file-code');
                break;
        }
        
        // Set command to open documents
        if (type === DocumentItemType.Document || type === DocumentItemType.Template) {
            this.command = {
                title: 'Open Document',
                command: 'vscode.open',
                arguments: [vscode.Uri.file(path)]
            };
        }
    }
}

/**
 * Tree data provider for the document explorer
 */
class DocumentTreeDataProvider implements vscode.TreeDataProvider<DocumentTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DocumentTreeItem | undefined> = new vscode.EventEmitter<DocumentTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<DocumentTreeItem | undefined> = this._onDidChangeTreeData.event;
    
    private workspaceFolders: vscode.Uri[] = [];
    private logger: Logger;
    
    constructor(logger: Logger) {
        this.logger = logger;
    }
    
    /**
     * Set workspace folders for the document explorer
     */
    public setWorkspaceFolders(folders: vscode.Uri[]): void {
        this.workspaceFolders = folders;
    }
    
    /**
     * Refresh the tree view
     */
    public refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
    
    /**
     * Get tree item for a given element
     */
    public getTreeItem(element: DocumentTreeItem): vscode.TreeItem {
        return element;
    }
    
    /**
     * Get children elements for a given element
     */
    public async getChildren(element?: DocumentTreeItem): Promise<DocumentTreeItem[]> {
        if (!element) {
            // Root level - show workspace folders
            return this.workspaceFolders.map(folder => {
                return new DocumentTreeItem(
                    path.basename(folder.fsPath),
                    folder.fsPath,
                    DocumentItemType.Folder,
                    vscode.TreeItemCollapsibleState.Collapsed
                );
            });
        } else if (element.type === DocumentItemType.Folder) {
            // Folder level - show documents and subdirectories
            try {
                const items: DocumentTreeItem[] = [];
                const entries = fs.readdirSync(element.path, { withFileTypes: true });
                
                // Add folders first
                entries
                    .filter(entry => entry.isDirectory())
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .forEach(entry => {
                        items.push(new DocumentTreeItem(
                            entry.name,
                            path.join(element.path, entry.name),
                            DocumentItemType.Folder,
                            vscode.TreeItemCollapsibleState.Collapsed
                        ));
                    });
                
                // Then add files
                entries
                    .filter(entry => entry.isFile())
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .forEach(entry => {
                        const ext = path.extname(entry.name).toLowerCase();
                        // Determine if this is a document or template
                        const isTemplate = ['.template', '.hbs', '.handlebars', '.tmpl'].includes(ext);
                        const isDocument = ['.md', '.txt', '.doc', '.docx', '.rtf', '.pdf', '.json'].includes(ext);
                        
                        if (isTemplate || isDocument) {
                            items.push(new DocumentTreeItem(
                                entry.name,
                                path.join(element.path, entry.name),
                                isTemplate ? DocumentItemType.Template : DocumentItemType.Document,
                                vscode.TreeItemCollapsibleState.None
                            ));
                        }
                    });
                
                return items;
            } catch (error) {
                this.logger.error(`Error reading directory ${element.path}: ${error}`);
                return [];
            }
        }
        
        return [];
    }
}
