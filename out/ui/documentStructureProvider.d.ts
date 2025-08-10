import * as vscode from 'vscode';
/**
 * Document structure tree item
 */
export declare class DocumentItem extends vscode.TreeItem {
    readonly label: string;
    readonly collapsibleState: vscode.TreeItemCollapsibleState;
    readonly type: 'section' | 'clause' | 'reference' | 'definition';
    readonly range?: vscode.Range | undefined;
    readonly children: DocumentItem[];
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, type: 'section' | 'clause' | 'reference' | 'definition', range?: vscode.Range | undefined, children?: DocumentItem[]);
}
/**
 * Document Structure Provider - Provides a tree view of document structure
 */
export declare class DocumentStructureProvider implements vscode.TreeDataProvider<DocumentItem>, vscode.Disposable {
    private readonly context;
    private logger;
    private eventBus;
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<DocumentItem | undefined | null | void>;
    private disposables;
    private documentItems;
    private activeEditor?;
    /**
     * Create a new Document Structure Provider
     * @param context Extension context
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Handle active editor change
     * @param editor New active editor
     */
    private handleActiveEditorChange;
    /**
     * Handle document change
     * @param event Text document change event
     */
    private handleDocumentChange;
    /**
     * Parse document structure
     * @param document Text document
     */
    private parseDocument;
    /**
     * Check if document is a legal document
     * @param document Text document
     * @returns True if document is a legal document
     */
    private isLegalDocument;
    /**
     * Parse sections from document
     * @param document Text document
     * @returns Array of section items
     */
    private parseSections;
    /**
     * Parse clauses for a section
     * @param document Text document
     * @param sectionStart Section start index
     * @param sectionLength Section length
     * @returns Array of clause items
     */
    private parseClausesForSection;
    /**
     * Parse definitions from document
     * @param document Text document
     * @returns Array of definition items
     */
    private parseDefinitions;
    /**
     * Parse references from document
     * @param document Text document
     * @returns Array of reference items
     */
    private parseReferences;
    /**
     * Refresh tree view
     */
    refresh(): void;
    /**
     * Get tree item for element
     * @param element Document item
     * @returns Tree item
     */
    getTreeItem(element: DocumentItem): vscode.TreeItem;
    /**
     * Get children of element
     * @param element Document item
     * @returns Array of child document items
     */
    getChildren(element?: DocumentItem): DocumentItem[];
    /**
     * Dispose document structure provider
     */
    dispose(): void;
}
