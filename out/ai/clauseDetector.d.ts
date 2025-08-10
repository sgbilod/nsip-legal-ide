import { DocumentAnalysis } from './documentAnalyzer';
export interface ClauseDetectionResult {
    clauses: DetectedClause[];
    patterns: ClausePattern[];
    statistics: ClauseStatistics;
}
export interface DetectedClause {
    id: string;
    type: string;
    subtype: string;
    text: string;
    startPosition: number;
    endPosition: number;
    confidence: number;
    importance: number;
    context: string;
    patternMatched?: string;
    classification: ClassificationResult;
    metadata: Record<string, any>;
}
export interface ClausePattern {
    id: string;
    name: string;
    description: string;
    regex: string | RegExp;
    keyPhrases: string[];
    priority: number;
    type: string;
    subtype: string;
    examples: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ClauseStatistics {
    totalClauses: number;
    typeDistribution: Record<string, number>;
    averageConfidence: number;
    detectionTime: number;
}
export interface ClassificationResult {
    type: string;
    subtype: string;
    confidence: number;
    alternativeTypes: AlternativeType[];
}
export interface AlternativeType {
    type: string;
    confidence: number;
}
/**
 * Clause Detector - Intelligent clause detection and classification system
 */
export declare class ClauseDetector {
    private logger;
    private eventBus;
    private documentAnalyzer;
    private patterns;
    /**
     * Create a new Clause Detector
     */
    constructor();
    /**
     * Initialize the clause detector
     */
    initialize(): Promise<void>;
    /**
     * Load clause patterns from various sources
     */
    private loadClausePatterns;
    /**
     * Create indemnification clause pattern
     */
    private createIndemnificationPattern;
    /**
     * Create limitation of liability clause pattern
     */
    private createLimitationOfLiabilityPattern;
    /**
     * Create confidentiality clause pattern
     */
    private createConfidentialityPattern;
    /**
     * Create termination clause pattern
     */
    private createTerminationPattern;
    /**
     * Create governing law clause pattern
     */
    private createGoverningLawPattern;
    /**
     * Create force majeure clause pattern
     */
    private createForceMatjeurePattern;
    /**
     * Create dispute resolution clause pattern
     */
    private createDisputeResolutionPattern;
    /**
     * Create assignment clause pattern
     */
    private createAssignmentPattern;
    /**
     * Create intellectual property clause pattern
     */
    private createIntellectualPropertyPattern;
    /**
     * Create non-compete clause pattern
     */
    private createNonCompetePattern;
    /**
     * Process an analyzed document to detect clauses
     * @param analysis Document analysis
     */
    processAnalyzedDocument(analysis: DocumentAnalysis): Promise<void>;
    /**
     * Detect clauses in a document
     * @param document Document text
     * @returns Clause detection result
     */
    detectClauses(document: string): Promise<ClauseDetectionResult>;
    /**
     * Detect clauses using patterns
     * @param document Document text
     * @returns Array of detected clauses
     */
    private detectClausesWithPatterns;
    /**
     * Classify clauses using AI
     * @param clauses Detected clauses
     * @param document Full document text
     * @returns Classified clauses
     */
    private classifyClauses;
    /**
     * Get possible alternative types for a clause type
     * @param type Clause type
     * @returns Array of possible alternative types
     */
    private getPossibleAlternativeTypes;
    /**
     * Dispose the clause detector
     */
    dispose(): void;
}
