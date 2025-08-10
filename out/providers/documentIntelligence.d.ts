import * as vscode from 'vscode';
import { IService } from '../core/serviceRegistry';
/**
 * Document Intelligence Provider - Provides document analysis and intelligence features
 */
export declare class DocumentIntelligenceProvider implements vscode.CompletionItemProvider, vscode.HoverProvider, IService {
    private context;
    private logger;
    private legalTerms;
    /**
     * Create a new document intelligence provider
     * @param context Extension context
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize the document intelligence provider
     */
    initialize(): Promise<void>;
    /**
     * Load legal terms from extension resources
     */
    private loadLegalTerms;
    /**
     * Analyze a document
     * @param document The document to analyze
     * @returns Analysis results
     */
    analyzeDocument(document: vscode.TextDocument): Promise<DocumentAnalysis>;
    /**
     * Provide completion items
     */
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>>;
    /**
     * Provide hover information
     */
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover>;
    /**
     * Dispose the document intelligence provider
     */
    dispose(): void;
}
/**
 * Document analysis interface
 */
export interface DocumentAnalysis {
    diagnostics: vscode.Diagnostic[];
    insights: DocumentInsight[];
    riskAssessment: RiskAssessment;
}
/**
 * Document insight interface
 */
export interface DocumentInsight {
    range: vscode.Range;
    term: string;
    message: string;
    riskLevel: 'low' | 'medium' | 'high';
}
/**
 * Risk assessment interface
 */
export interface RiskAssessment {
    overallRisk: 'low' | 'medium' | 'high';
    areas: RiskArea[];
}
/**
 * Risk area interface
 */
export interface RiskArea {
    name: string;
    risk: 'low' | 'medium' | 'high';
    description: string;
}
