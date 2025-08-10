import * as vscode from 'vscode';
import { ServiceRegistry } from '../core/serviceRegistry';
import { Logger } from '../core/logger';
import { EventBus } from '../core/eventBus';

/**
 * Document structure tree item
 */
export class DocumentItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: 'section' | 'clause' | 'reference' | 'definition',
        public readonly range?: vscode.Range,
        public readonly children: DocumentItem[] = []
    ) {
        super(label, collapsibleState);
        
        // Set context value for conditional display in views
        this.contextValue = type;
        
        // Set icon based on type
        switch (type) {
            case 'section':
                this.iconPath = new vscode.ThemeIcon('symbol-class');
                break;
            case 'clause':
                this.iconPath = new vscode.ThemeIcon('symbol-method');
                break;
            case 'reference':
                this.iconPath = new vscode.ThemeIcon('references');
                break;
            case 'definition':
                this.iconPath = new vscode.ThemeIcon('symbol-constant');
                break;
        }
        
        // Set tooltip
        this.tooltip = label;
        
        // Set command to reveal range in editor
        if (range) {
            this.command = {
                command: 'nsipLegal.revealRange',
                title: 'Reveal in Editor',
                arguments: [range]
            };
        }
    }
}

/**
 * Document Structure Provider - Provides a tree view of document structure
 */
export class DocumentStructureProvider implements vscode.TreeDataProvider<DocumentItem>, vscode.Disposable {
    private logger: Logger;
    private eventBus: EventBus;
    private _onDidChangeTreeData: vscode.EventEmitter<DocumentItem | undefined | null | void> = new vscode.EventEmitter<DocumentItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DocumentItem | undefined | null | void> = this._onDidChangeTreeData.event;
    private disposables: vscode.Disposable[] = [];
    private documentItems: DocumentItem[] = [];
    private activeEditor?: vscode.TextEditor;
    
    /**
     * Create a new Document Structure Provider
     * @param context Extension context
     */
    constructor(private readonly context: vscode.ExtensionContext) {
        this.logger = ServiceRegistry.getInstance().get<Logger>('logger');
        this.eventBus = ServiceRegistry.getInstance().get<EventBus>('eventBus');
        
        // Register tree data provider
        this.disposables.push(
            vscode.window.registerTreeDataProvider('nsipLegal.documentStructure', this)
        );
        
        // Register views
        this.disposables.push(
            vscode.window.createTreeView('nsipLegal.documentStructure', {
                treeDataProvider: this,
                showCollapseAll: true
            })
        );
        
        // Register for editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(this.handleActiveEditorChange.bind(this))
        );
        
        // Register for document changes
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(this.handleDocumentChange.bind(this))
        );
        
        // Handle initial active editor
        this.activeEditor = vscode.window.activeTextEditor;
        if (this.activeEditor) {
            this.parseDocument(this.activeEditor.document);
        }
    }
    
    /**
     * Handle active editor change
     * @param editor New active editor
     */
    private async handleActiveEditorChange(editor?: vscode.TextEditor): Promise<void> {
        this.activeEditor = editor;
        
        if (editor) {
            await this.parseDocument(editor.document);
            this.refresh();
        }
    }
    
    /**
     * Handle document change
     * @param event Text document change event
     */
    private async handleDocumentChange(event: vscode.TextDocumentChangeEvent): Promise<void> {
        if (this.activeEditor && event.document === this.activeEditor.document) {
            await this.parseDocument(event.document);
            this.refresh();
        }
    }
    
    /**
     * Parse document structure
     * @param document Text document
     */
    private async parseDocument(document: vscode.TextDocument): Promise<void> {
        this.logger.info(`Parsing document structure: ${document.fileName}`);
        
        try {
            // Reset items
            this.documentItems = [];
            
            // Check if document is a legal document
            if (!this.isLegalDocument(document)) {
                return;
            }
            
            const text = document.getText();
            
            // Parse sections
            const sections = this.parseSections(document);
            this.documentItems.push(...sections);
            
            // Parse definitions
            const definitions = this.parseDefinitions(document);
            
            // If we have definitions, add them as a special section
            if (definitions.length > 0) {
                const definitionsSection = new DocumentItem(
                    'Definitions',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'section',
                    undefined,
                    definitions
                );
                
                this.documentItems.push(definitionsSection);
            }
            
            // Parse references
            const references = this.parseReferences(document);
            
            // If we have references, add them as a special section
            if (references.length > 0) {
                const referencesSection = new DocumentItem(
                    'References',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'section',
                    undefined,
                    references
                );
                
                this.documentItems.push(referencesSection);
            }
            
            this.logger.info(`Parsed document structure with ${this.documentItems.length} top-level items`);
        } catch (error) {
            this.logger.error('Failed to parse document structure', error);
        }
    }
    
    /**
     * Check if document is a legal document
     * @param document Text document
     * @returns True if document is a legal document
     */
    private isLegalDocument(document: vscode.TextDocument): boolean {
        // Check language ID (markdown or plaintext)
        const isTextDocument = 
            document.languageId === 'markdown' || 
            document.languageId === 'plaintext';
        
        if (!isTextDocument) {
            return false;
        }
        
        // Check content for legal terms
        const text = document.getText();
        const legalKeywords = [
            'agreement', 'contract', 'party', 'parties', 'clause',
            'section', 'term', 'provision', 'hereby', 'shall',
            'rights', 'obligations', 'law', 'jurisdiction'
        ];
        
        // If at least 3 legal keywords are found, consider it a legal document
        const keywordsFound = legalKeywords.filter(keyword => 
            new RegExp(`\\b${keyword}\\b`, 'i').test(text)
        );
        
        return keywordsFound.length >= 3;
    }
    
    /**
     * Parse sections from document
     * @param document Text document
     * @returns Array of section items
     */
    private parseSections(document: vscode.TextDocument): DocumentItem[] {
        const sections: DocumentItem[] = [];
        const text = document.getText();
        
        // Match section headers (numbered or not)
        // This regex looks for patterns like:
        // 1. Section Title
        // Section 1. Title
        // Article 1. Title
        const sectionRegex = /^(?:(?:\d+\.)|(?:Section\s+\d+\.)|(?:Article\s+\d+\.))\s+(.+)$/gmi;
        
        let match: RegExpExecArray | null;
        while ((match = sectionRegex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            
            // Get section title
            const title = match[1] ? match[1].trim() : match[0].trim();
            
            // Create section item
            const section = new DocumentItem(
                title,
                vscode.TreeItemCollapsibleState.Collapsed,
                'section',
                range
            );
            
            // Parse clauses for this section
            const clauses = this.parseClausesForSection(document, match.index, match[0].length);
            section.children.push(...clauses);
            
            sections.push(section);
        }
        
        return sections;
    }
    
    /**
     * Parse clauses for a section
     * @param document Text document
     * @param sectionStart Section start index
     * @param sectionLength Section length
     * @returns Array of clause items
     */
    private parseClausesForSection(
        document: vscode.TextDocument,
        sectionStart: number,
        sectionLength: number
    ): DocumentItem[] {
        const clauses: DocumentItem[] = [];
        const text = document.getText();
        
        // Define where to start looking for clauses
        const startIndex = sectionStart + sectionLength;
        
        // Find the next section or end of document
        const nextSectionRegex = /^(?:(?:\d+\.)|(?:Section\s+\d+\.)|(?:Article\s+\d+\.))/gmi;
        nextSectionRegex.lastIndex = startIndex;
        
        const nextSectionMatch = nextSectionRegex.exec(text);
        const endIndex = nextSectionMatch ? nextSectionMatch.index : text.length;
        
        // Get the section text
        const sectionText = text.substring(startIndex, endIndex);
        
        // Parse clauses (sub-numbered items or paragraphs)
        const clauseRegex = /^(\s*)(?:(?:[a-z\d]+[\)\.]\s+)|(?:\([a-z\d]+\)\s+))(.+)$/gmi;
        
        let clauseMatch: RegExpExecArray | null;
        while ((clauseMatch = clauseRegex.exec(sectionText)) !== null) {
            const clauseStartIndex = startIndex + clauseMatch.index;
            const clauseEndIndex = clauseStartIndex + clauseMatch[0].length;
            
            const startPos = document.positionAt(clauseStartIndex);
            const endPos = document.positionAt(clauseEndIndex);
            const range = new vscode.Range(startPos, endPos);
            
            // Get clause title/text
            const clauseText = clauseMatch[2] ? clauseMatch[2].trim() : clauseMatch[0].trim();
            
            // Create clause item
            const clause = new DocumentItem(
                clauseText.length > 50 ? clauseText.substring(0, 47) + '...' : clauseText,
                vscode.TreeItemCollapsibleState.None,
                'clause',
                range
            );
            
            clauses.push(clause);
        }
        
        return clauses;
    }
    
    /**
     * Parse definitions from document
     * @param document Text document
     * @returns Array of definition items
     */
    private parseDefinitions(document: vscode.TextDocument): DocumentItem[] {
        const definitions: DocumentItem[] = [];
        const text = document.getText();
        
        // Match definitions
        // This regex looks for patterns like:
        // "Term" means ...
        // "Defined Term" shall mean ...
        const definitionRegex = /[""]([^""]+)[""](?:\s+shall)?(?:\s+(?:mean|refer to|be defined as))(?![^()]*\))/gi;
        
        let match: RegExpExecArray | null;
        while ((match = definitionRegex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            
            // Get definition term
            const term = match[1] ? match[1].trim() : match[0].trim();
            
            // Create definition item
            const definition = new DocumentItem(
                term,
                vscode.TreeItemCollapsibleState.None,
                'definition',
                range
            );
            
            definitions.push(definition);
        }
        
        return definitions;
    }
    
    /**
     * Parse references from document
     * @param document Text document
     * @returns Array of reference items
     */
    private parseReferences(document: vscode.TextDocument): DocumentItem[] {
        const references: DocumentItem[] = [];
        const text = document.getText();
        
        // Match references to sections, articles, etc.
        // This regex looks for patterns like:
        // Section 3.2
        // Article 5
        const referenceRegex = /\b(?:Section|Article|Clause|Paragraph)\s+(\d+(?:\.\d+)?)/gi;
        
        let match: RegExpExecArray | null;
        while ((match = referenceRegex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            
            // Get reference
            const reference = match[0].trim();
            
            // Skip if this is a section header
            const lineStart = document.lineAt(startPos.line).text.trimStart();
            if (lineStart.startsWith(reference)) {
                continue;
            }
            
            // Create reference item
            const referenceItem = new DocumentItem(
                reference,
                vscode.TreeItemCollapsibleState.None,
                'reference',
                range
            );
            
            references.push(referenceItem);
        }
        
        return references;
    }
    
    /**
     * Refresh tree view
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    
    /**
     * Get tree item for element
     * @param element Document item
     * @returns Tree item
     */
    getTreeItem(element: DocumentItem): vscode.TreeItem {
        return element;
    }
    
    /**
     * Get children of element
     * @param element Document item
     * @returns Array of child document items
     */
    getChildren(element?: DocumentItem): DocumentItem[] {
        if (!element) {
            return this.documentItems;
        }
        
        return element.children;
    }
    
    /**
     * Dispose document structure provider
     */
    dispose(): void {
        // Dispose all disposables
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        
        // Clear arrays
        this.disposables = [];
        this.documentItems = [];
    }
}
