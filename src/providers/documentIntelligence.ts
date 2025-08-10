import * as vscode from 'vscode';
import { IService } from '../core/interfaces';
import { ServiceRegistry } from '../core/serviceRegistry';
import { Logger } from '../core/logger';
import { IDocumentAnalysis, IEntity, IClause, IComplianceIssue } from '../core/interfaces';
import axios from 'axios';

/**
 * Document Intelligence Provider - Provides document analysis and intelligence features
 */
export class DocumentIntelligenceProvider implements vscode.CompletionItemProvider, vscode.HoverProvider, IService {
    private logger: Logger;
    private legalTerms: Map<string, LegalTerm> = new Map();
    private aiProvider: string = 'openai';
    private aiApiKey: string | undefined;
    
    /**
     * Create a new document intelligence provider
     * @param context Extension context
     */
    constructor(private context: vscode.ExtensionContext) {
        this.logger = ServiceRegistry.getInstance().get<Logger>('logger');
    }
    
    /**
     * Initialize the document intelligence provider
     */
    async initialize(): Promise<void> {
        // Load configuration
        this.loadConfiguration();
        
        // Load legal terms
        await this.loadLegalTerms();
        
        this.logger.info('Document intelligence provider initialized');
    }
    
    /**
     * Load configuration from VS Code settings
     */
    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('nsip');
        this.aiProvider = config.get<string>('ai.provider', 'openai');
        
        // In a real implementation, we would securely retrieve API keys
        // This is just a placeholder for demonstration
        this.aiApiKey = this.context.secrets.get('nsip.ai.apiKey');
        
        this.logger.info(`AI Provider configured: ${this.aiProvider}`);
    }
    
    /**
     * Load legal terms from extension resources
     */
    private async loadLegalTerms(): Promise<void> {
        try {
            // In a real implementation, these would be loaded from a JSON file
            // For this example, we'll hard-code a few terms
            this.legalTerms.set('indemnification', {
                term: 'indemnification',
                definition: 'A duty to compensate for a loss; security against legal liability for one\'s actions.',
                riskLevel: 'high',
                alternatives: ['hold harmless', 'defend']
            });
            
            this.legalTerms.set('force majeure', {
                term: 'force majeure',
                definition: 'Unforeseeable circumstances that prevent someone from fulfilling a contract.',
                riskLevel: 'medium',
                alternatives: ['act of god', 'unavoidable accident']
            });
            
            this.legalTerms.set('warranty', {
                term: 'warranty',
                definition: 'A promise that something in furtherance of the contract is guaranteed by one of the contracting parties.',
                riskLevel: 'medium',
                alternatives: ['guarantee', 'assurance']
            });
            
            this.legalTerms.set('liability', {
                term: 'liability',
                definition: 'The state of being legally responsible for something.',
                riskLevel: 'high',
                alternatives: ['legal responsibility', 'obligation']
            });
            
            this.logger.info(`Loaded ${this.legalTerms.size} legal terms`);
        } catch (error) {
            this.logger.error('Failed to load legal terms', error);
        }
    }
    
    /**
     * Analyze a document
     * @param document The document to analyze
     * @returns Analysis results
     */
    async analyzeDocument(document: vscode.TextDocument): Promise<IDocumentAnalysis> {
        this.logger.info(`Analyzing document: ${document.fileName}`);
        
        const text = document.getText();
        
        try {
            // If we have AI provider configured, use it for enhanced analysis
            if (this.aiApiKey && this.aiProvider !== 'local') {
                return await this.performAIAnalysis(text);
            } else {
                // Fall back to basic rule-based analysis
                return this.performBasicAnalysis(document);
            }
        } catch (error) {
            this.logger.error('Error analyzing document', error);
            
            // Return empty analysis on error
            return {
                entities: [],
                clauses: [],
                issues: [],
                metadata: {
                    error: 'Analysis failed',
                    message: error instanceof Error ? error.message : String(error)
                }
            };
        }
    }
    
    /**
     * Perform AI-powered document analysis
     * @param text Document text
     * @returns Analysis results
     */
    private async performAIAnalysis(text: string): Promise<IDocumentAnalysis> {
        this.logger.info(`Performing AI analysis with provider: ${this.aiProvider}`);
        
        // In a real implementation, we would call the AI provider's API
        // This is a mock implementation for demonstration purposes
        
        if (this.aiProvider === 'openai') {
            try {
                // Mock API call - in real implementation, this would be a call to OpenAI API
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
                
                // Simulate entities and clauses extraction
                const entities: IEntity[] = [
                    {
                        id: '1',
                        type: 'person',
                        text: 'John Smith',
                        startIndex: text.indexOf('John Smith'),
                        endIndex: text.indexOf('John Smith') + 10
                    },
                    {
                        id: '2',
                        type: 'organization',
                        text: 'Acme Corporation',
                        startIndex: text.indexOf('Acme Corporation'),
                        endIndex: text.indexOf('Acme Corporation') + 16
                    }
                ];
                
                const clauses: IClause[] = [
                    {
                        id: '1',
                        type: 'indemnification',
                        title: 'Indemnification',
                        content: text.includes('indemnification') 
                            ? text.substring(text.indexOf('indemnification'), text.indexOf('indemnification') + 150)
                            : 'No indemnification clause found',
                        startIndex: text.indexOf('indemnification'),
                        endIndex: text.indexOf('indemnification') + 150,
                        entities: []
                    },
                    {
                        id: '2',
                        type: 'limitation of liability',
                        title: 'Limitation of Liability',
                        content: text.includes('liability') 
                            ? text.substring(text.indexOf('liability'), text.indexOf('liability') + 150)
                            : 'No liability clause found',
                        startIndex: text.indexOf('liability'),
                        endIndex: text.indexOf('liability') + 150,
                        entities: []
                    }
                ];
                
                const issues: IComplianceIssue[] = [
                    {
                        ruleId: 'missing-clause',
                        message: 'Document is missing a force majeure clause',
                        severity: 'warning'
                    },
                    {
                        ruleId: 'ambiguous-term',
                        message: 'The term "reasonable efforts" is ambiguous and may lead to disputes',
                        severity: 'info',
                        line: 10,
                        suggestion: 'Consider defining "reasonable efforts" more precisely'
                    }
                ];
                
                return {
                    entities,
                    clauses,
                    issues,
                    metadata: {
                        aiProvider: this.aiProvider,
                        confidence: 0.85,
                        processingTime: 0.5
                    }
                };
            } catch (error) {
                this.logger.error('Error calling OpenAI API', error);
                throw new Error('AI analysis failed');
            }
        } else {
            throw new Error(`Unsupported AI provider: ${this.aiProvider}`);
        }
    }
    
    /**
     * Perform basic rule-based document analysis
     * @param document The document to analyze
     * @returns Analysis results
     */
    private performBasicAnalysis(document: vscode.TextDocument): IDocumentAnalysis {
        const text = document.getText();
        const diagnostics: vscode.Diagnostic[] = [];
        const entities: IEntity[] = [];
        const clauses: IClause[] = [];
        const issues: IComplianceIssue[] = [];
        
        // Simple term-based analysis
        for (const [term, info] of this.legalTerms.entries()) {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            let match;
            
            while ((match = regex.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + term.length);
                const range = new vscode.Range(startPos, endPos);
                
                // Add diagnostic for high-risk terms
                if (info.riskLevel === 'high') {
                    diagnostics.push(new vscode.Diagnostic(
                        range,
                        `High-risk legal term: ${term}. Consider alternatives: ${info.alternatives.join(', ')}`,
                        vscode.DiagnosticSeverity.Warning
                    ));
                    
                    issues.push({
                        ruleId: 'high-risk-term',
                        message: `High-risk legal term: ${term}. Consider alternatives: ${info.alternatives.join(', ')}`,
                        severity: 'warning',
                        line: startPos.line,
                        column: startPos.character,
                        suggestion: `Consider using alternatives like: ${info.alternatives.join(', ')}`
                    });
                }
                
                // Extract as clause
                const clauseStartIndex = Math.max(0, match.index - 50);
                const clauseEndIndex = Math.min(text.length, match.index + term.length + 150);
                const clauseContent = text.substring(clauseStartIndex, clauseEndIndex);
                
                clauses.push({
                    id: `clause-${term}-${match.index}`,
                    type: term,
                    title: term.charAt(0).toUpperCase() + term.slice(1),
                    content: clauseContent,
                    startIndex: clauseStartIndex,
                    endIndex: clauseEndIndex,
                    entities: []
                });
            }
        }
        
        // Check for missing sections (very basic)
        const sections = [
            'indemnification',
            'liability',
            'warranty',
            'termination'
        ];
        
        const missingSections = sections.filter(section => 
            !text.toLowerCase().includes(section.toLowerCase())
        );
        
        if (missingSections.length > 0) {
            issues.push({
                ruleId: 'missing-sections',
                message: `Document is missing the following sections: ${missingSections.join(', ')}`,
                severity: 'warning'
            });
        }
        
        // Update diagnostics collection
        const diagnosticsCollection = ServiceRegistry.getInstance().get<vscode.DiagnosticCollection>('diagnostics');
        diagnosticsCollection.set(document.uri, diagnostics);
        
        return {
            entities,
            clauses,
            issues,
            metadata: {
                analysisType: 'basic',
                missingTerms: missingSections
            }
        };
    }
    
    /**
     * Provide completion items
     */
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        
        // Simple completion items for legal terms
        const completionItems: vscode.CompletionItem[] = [];
        
        for (const [term, info] of this.legalTerms.entries()) {
            const item = new vscode.CompletionItem(term, vscode.CompletionItemKind.Text);
            item.documentation = new vscode.MarkdownString(`**${term}**: ${info.definition}`);
            item.detail = `Risk Level: ${info.riskLevel}`;
            
            completionItems.push(item);
        }
        
        return completionItems;
    }
    
    /**
     * Provide hover information
     */
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }
        
        const word = document.getText(range).toLowerCase();
        const legalTerm = this.legalTerms.get(word);
        
        if (legalTerm) {
            const content = new vscode.MarkdownString();
            content.appendMarkdown(`## ${legalTerm.term}\n\n`);
            content.appendMarkdown(`${legalTerm.definition}\n\n`);
            content.appendMarkdown(`**Risk Level**: ${legalTerm.riskLevel}\n\n`);
            
            if (legalTerm.alternatives.length > 0) {
                content.appendMarkdown(`**Alternatives**: ${legalTerm.alternatives.join(', ')}`);
            }
            
            return new vscode.Hover(content, range);
        }
        
        return null;
    }
    
    /**
     * Dispose the document intelligence provider
     */
    dispose(): void {
        // No resources to dispose
    }
}

/**
 * Legal term interface
 */
interface LegalTerm {
    term: string;
    definition: string;
    riskLevel: 'low' | 'medium' | 'high';
    alternatives: string[];
}
