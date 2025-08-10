interface Entity {
    text: string;
    type: EntityType;
    startPosition: number;
    endPosition: number;
    metadata: Record<string, any>;
}
type EntityType = 'PERSON' | 'ORGANIZATION' | 'DATE' | 'LOCATION' | 'LEGAL_TERM' | 'CLAUSE' | 'OBLIGATION' | 'RIGHT';
export interface DocumentAnalysis {
    structure: DocumentStructure;
    concepts: LegalConcept[];
    risks: Risk[];
    recommendations: Recommendation[];
    confidence: number;
    metadata: DocumentMetadata;
}
export interface DocumentStructure {
    sections: Section[];
    clauses: Clause[];
    definedTerms: DefinedTerm[];
    parties: Party[];
}
export interface Section {
    title: string;
    content: string;
    level: number;
    startPosition: number;
    endPosition: number;
    subsections: Section[];
}
export interface Clause {
    type: ClauseType;
    text: string;
    startPosition: number;
    endPosition: number;
    entities: Entity[];
    obligations: Obligation[];
    conditions: Condition[];
    importance: number;
}
export interface LegalConcept {
    name: string;
    description: string;
    relevance: number;
    occurrences: Occurrence[];
}
export interface Risk {
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    likelihood: number;
    impact: number;
    relatedClauses: Clause[];
    recommendations: string[];
}
export interface Recommendation {
    text: string;
    category: 'ADDITION' | 'MODIFICATION' | 'REMOVAL' | 'CLARIFICATION';
    importance: number;
    rationale: string;
    suggestedText?: string;
}
export interface DocumentMetadata {
    title?: string;
    author?: string;
    documentType: string;
    createdAt?: Date;
    modifiedAt?: Date;
    jurisdiction?: string;
    industry?: string;
    parties: Party[];
    tags: string[];
}
export interface DefinedTerm {
    term: string;
    definition: string;
    startPosition: number;
    endPosition: number;
}
export interface Party {
    name: string;
    type: 'INDIVIDUAL' | 'ORGANIZATION' | 'GOVERNMENT';
    role: string;
    occurrences: Occurrence[];
}
export interface Occurrence {
    text: string;
    startPosition: number;
    endPosition: number;
}
export interface Obligation {
    text: string;
    obligor: string;
    obligee: string;
    action: string;
    conditions: Condition[];
    deadline?: string;
}
export interface Condition {
    text: string;
    type: 'PREREQUISITE' | 'EXCEPTION' | 'LIMITATION';
}
export type ClauseType = 'INDEMNIFICATION' | 'LIMITATION_OF_LIABILITY' | 'WARRANTY' | 'TERMINATION' | 'GOVERNING_LAW' | 'CONFIDENTIALITY' | 'NON_COMPETE' | 'PAYMENT_TERMS' | 'INTELLECTUAL_PROPERTY' | 'DISPUTE_RESOLUTION' | 'FORCE_MAJEURE' | 'ASSIGNMENT' | 'AMENDMENT' | 'NOTICE' | 'SEVERABILITY' | 'ENTIRE_AGREEMENT' | 'OTHER';
export type AnalysisType = 'BASIC' | 'COMPREHENSIVE' | 'RISK' | 'COMPLIANCE' | 'COMPARISON';
/**
 * Document Analyzer - AI-powered document analysis system
 */
export declare class DocumentAnalyzer {
    private logger;
    private eventBus;
    private aiProviders;
    private nlpPipeline;
    /**
     * Create a new Document Analyzer
     */
    constructor();
    /**
     * Initialize the document analyzer
     */
    initialize(): Promise<void>;
    /**
     * Initialize AI providers
     */
    private initializeAIProviders;
    /**
     * Initialize NLP pipeline
     */
    private initializeNLPPipeline;
    /**
     * Analyze a document
     * @param document Document text
     * @param analysisType Type of analysis to perform
     * @returns Document analysis
     */
    analyzeDocument(document: string, analysisType?: AnalysisType): Promise<DocumentAnalysis>;
    /**
     * Extract document structure
     * @param document Document text
     * @returns Document structure
     */
    private extractStructure;
    /**
     * Parse sections from document
     * @param document Document text
     * @returns Array of sections
     */
    private parseSections;
    /**
     * Parse clauses from document
     * @param document Document text
     * @returns Array of clauses
     */
    private parseClauses;
    /**
     * Get key phrases for a clause type
     * @param clauseType Type of clause
     * @returns Array of key phrases
     */
    private getKeyPhrasesForClauseType;
    /**
     * Parse defined terms from document
     * @param document Document text
     * @returns Array of defined terms
     */
    private parseDefinedTerms;
    /**
     * Parse parties from document
     * @param document Document text
     * @returns Array of parties
     */
    private parseParties;
    /**
     * Identify legal concepts in document
     * @param document Document text
     * @returns Array of legal concepts
     */
    private identifyLegalConcepts;
    /**
     * Analyze risks in document
     * @param document Document text
     * @param concepts Legal concepts in document
     * @returns Array of risks
     */
    private analyzeRisks;
    /**
     * Generate recommendations for document improvement
     * @param structure Document structure
     * @param concepts Legal concepts in document
     * @param risks Risks in document
     * @returns Array of recommendations
     */
    private generateRecommendations;
    /**
     * Calculate confidence score for analysis
     * @returns Confidence score (0-1)
     */
    private calculateConfidence;
    /**
     * Extract metadata from document
     * @param document Document text
     * @returns Document metadata
     */
    private extractMetadata;
    /**
     * Dispose the document analyzer
     */
    dispose(): void;
}
export {};
