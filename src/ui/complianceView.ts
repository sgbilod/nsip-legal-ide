import * as vscode from 'vscode';
import { IService } from '../core/interfaces';
import { Logger } from '../core/logger';
import { ComplianceIssue } from '../compliance/complianceEngine';

/**
 * Interface for compliance view service
 */
export interface IComplianceView extends IService {
    /**
     * Show compliance issues in the view
     * @param issues List of compliance issues to display
     * @param documentUri The document URI these issues relate to
     */
    showIssues(issues: ComplianceIssue[], documentUri: vscode.Uri): void;
    
    /**
     * Clear all issues from the view
     */
    clearIssues(): void;
    
    /**
     * Focus the compliance view
     */
    focus(): void;
}

/**
 * Implementation of the compliance view using a VS Code TreeView
 */
export class ComplianceView implements IComplianceView {
    private treeView: vscode.TreeView<ComplianceTreeItem> | undefined;
    private treeDataProvider: ComplianceTreeDataProvider;
    private logger: Logger;
    
    constructor(logger: Logger) {
        this.logger = logger;
        this.treeDataProvider = new ComplianceTreeDataProvider();
    }
    
    public async initialize(): Promise<void> {
        this.treeView = vscode.window.createTreeView('nsipComplianceView', {
            treeDataProvider: this.treeDataProvider,
            showCollapseAll: true
        });
        
        this.logger.debug('ComplianceView initialized');
    }
    
    public dispose(): void {
        if (this.treeView) {
            this.treeView.dispose();
        }
        this.logger.debug('ComplianceView disposed');
    }
    
    public showIssues(issues: ComplianceIssue[], documentUri: vscode.Uri): void {
        this.logger.debug(`Showing ${issues.length} compliance issues for ${documentUri.fsPath}`);
        this.treeDataProvider.setIssues(issues, documentUri);
        this.focus();
    }
    
    public clearIssues(): void {
        this.logger.debug('Clearing compliance issues');
        this.treeDataProvider.clear();
    }
    
    public focus(): void {
        if (this.treeView && this.treeDataProvider.getFirstItem()) {
            this.treeView.reveal(this.treeDataProvider.getFirstItem()!);
        }
    }
}

/**
 * Tree item representing a compliance issue
 */
class ComplianceTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly issue: ComplianceIssue,
        public readonly documentUri: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        
        // Set severity icon
        switch (issue.severity) {
            case 'error':
            case 'critical':
                this.iconPath = new vscode.ThemeIcon('error');
                break;
            case 'warning':
                this.iconPath = new vscode.ThemeIcon('warning');
                break;
            case 'info':
                this.iconPath = new vscode.ThemeIcon('info');
                break;
            default:
                this.iconPath = new vscode.ThemeIcon('question');
        }
        
        // Set tooltip and description
        this.tooltip = issue.message;
        this.description = issue.location ? `Line ${issue.location.startLine + 1}` : 'Unknown location';
        
        // Set command to reveal the issue in the document
        if (issue.location) {
            this.command = {
                title: 'Reveal Issue',
                command: 'vscode.open',
                arguments: [
                    documentUri,
                    {
                        selection: new vscode.Range(
                            issue.location.startLine,
                            issue.location.startCharacter,
                            issue.location.endLine,
                            issue.location.endCharacter
                        )
                    }
                ]
            };
        }
    }
}

/**
 * Tree data provider for compliance issues
 */
class ComplianceTreeDataProvider implements vscode.TreeDataProvider<ComplianceTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ComplianceTreeItem | undefined> = new vscode.EventEmitter<ComplianceTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ComplianceTreeItem | undefined> = this._onDidChangeTreeData.event;
    
    private issues: ComplianceTreeItem[] = [];
    
    /**
     * Set compliance issues for display
     * @param issues The compliance issues to display
     * @param documentUri The document URI these issues relate to
     */
    public setIssues(issues: ComplianceIssue[], documentUri: vscode.Uri): void {
        this.issues = issues.map(issue => 
            new ComplianceTreeItem(
                issue.message,
                issue,
                documentUri,
                vscode.TreeItemCollapsibleState.None
            )
        );
        
        this.refresh();
    }
    
    /**
     * Clear all issues
     */
    public clear(): void {
        this.issues = [];
        this.refresh();
    }
    
    /**
     * Get the first item in the tree (for auto-focusing)
     */
    public getFirstItem(): ComplianceTreeItem | undefined {
        return this.issues.length > 0 ? this.issues[0] : undefined;
    }
    
    /**
     * Refresh the tree view
     */
    private refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
    
    /**
     * Get tree item for a given element
     */
    public getTreeItem(element: ComplianceTreeItem): vscode.TreeItem {
        return element;
    }
    
    /**
     * Get children elements for a given element
     */
    public getChildren(element?: ComplianceTreeItem): ComplianceTreeItem[] {
        if (element) {
            return [];
        }
        
        return this.issues;
    }
}
