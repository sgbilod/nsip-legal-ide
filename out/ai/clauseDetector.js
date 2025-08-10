"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClauseDetector = void 0;
const serviceRegistry_1 = require("../core/serviceRegistry");
/**
 * Clause Detector - Intelligent clause detection and classification system
 */
class ClauseDetector {
    /**
     * Create a new Clause Detector
     */
    constructor() {
        this.patterns = [];
        this.logger = serviceRegistry_1.ServiceRegistry.getInstance().get('logger');
        this.eventBus = serviceRegistry_1.ServiceRegistry.getInstance().get('eventBus');
        this.documentAnalyzer = serviceRegistry_1.ServiceRegistry.getInstance().get('documentAnalyzer');
    }
    /**
     * Initialize the clause detector
     */
    async initialize() {
        this.logger.info('Initializing clause detector');
        // Load clause patterns
        await this.loadClausePatterns();
        // Register for events
        this.eventBus.subscribe('document.analyzed', {
            id: 'clause-detector-analyzed',
            handle: this.processAnalyzedDocument.bind(this)
        });
        this.eventBus.subscribe('clause.detect', {
            id: 'clause-detector-detect',
            handle: this.detectClauses.bind(this)
        });
        this.logger.info('Clause detector initialized');
    }
    /**
     * Load clause patterns from various sources
     */
    async loadClausePatterns() {
        try {
            // In a real implementation, patterns would be loaded from a database or file
            // For this example, we'll create some built-in patterns
            this.patterns = [
                this.createIndemnificationPattern(),
                this.createLimitationOfLiabilityPattern(),
                this.createConfidentialityPattern(),
                this.createTerminationPattern(),
                this.createGoverningLawPattern(),
                this.createForceMatjeurePattern(),
                this.createDisputeResolutionPattern(),
                this.createAssignmentPattern(),
                this.createIntellectualPropertyPattern(),
                this.createNonCompetePattern()
            ];
            this.logger.info(`Loaded ${this.patterns.length} clause patterns`);
        }
        catch (error) {
            this.logger.error('Failed to load clause patterns', error);
            throw new Error(`Clause pattern loading failed: ${error.message}`);
        }
    }
    /**
     * Create indemnification clause pattern
     */
    createIndemnificationPattern() {
        return {
            id: 'indemnification-001',
            name: 'Indemnification Clause',
            description: 'Identifies indemnification clauses in contracts',
            regex: /\b(?:indemnify|indemnification|indemnity|hold\s+harmless|defend)\b/i,
            keyPhrases: [
                'indemnify',
                'indemnification',
                'indemnity',
                'hold harmless',
                'defend against',
                'shall defend'
            ],
            priority: 10,
            type: 'INDEMNIFICATION',
            subtype: 'GENERAL',
            examples: [
                'The Contractor shall indemnify and hold harmless the Company from any claims arising out of...',
                'Supplier agrees to indemnify, defend and hold harmless Customer against all losses...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Create limitation of liability clause pattern
     */
    createLimitationOfLiabilityPattern() {
        return {
            id: 'limitation-of-liability-001',
            name: 'Limitation of Liability Clause',
            description: 'Identifies limitation of liability clauses in contracts',
            regex: /\b(?:limitation\s+of\s+liability|limit\s+liability|not\s+be\s+liable|no\s+liability|in\s+no\s+event)\b/i,
            keyPhrases: [
                'limitation of liability',
                'limit liability',
                'not be liable',
                'no liability',
                'in no event',
                'shall not exceed',
                'maximum liability'
            ],
            priority: 10,
            type: 'LIMITATION_OF_LIABILITY',
            subtype: 'GENERAL',
            examples: [
                'In no event shall the Company be liable for any indirect, special, incidental, or consequential damages...',
                'The total liability of Supplier under this Agreement shall not exceed the amount paid by Customer...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Create confidentiality clause pattern
     */
    createConfidentialityPattern() {
        return {
            id: 'confidentiality-001',
            name: 'Confidentiality Clause',
            description: 'Identifies confidentiality clauses in contracts',
            regex: /\b(?:confidential|confidentiality|non-disclosure|shall\s+not\s+disclose)\b/i,
            keyPhrases: [
                'confidential',
                'confidentiality',
                'non-disclosure',
                'shall not disclose',
                'proprietary information',
                'keep confidential',
                'maintain secrecy'
            ],
            priority: 9,
            type: 'CONFIDENTIALITY',
            subtype: 'GENERAL',
            examples: [
                'The Recipient shall maintain all Confidential Information in strict confidence...',
                'Each party agrees to keep confidential all proprietary information disclosed by the other party...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Create termination clause pattern
     */
    createTerminationPattern() {
        return {
            id: 'termination-001',
            name: 'Termination Clause',
            description: 'Identifies termination clauses in contracts',
            regex: /\b(?:termination|terminate|terminating|terminates)\b/i,
            keyPhrases: [
                'termination',
                'terminate',
                'right to terminate',
                'may terminate',
                'termination for convenience',
                'termination for cause',
                'notice of termination'
            ],
            priority: 8,
            type: 'TERMINATION',
            subtype: 'GENERAL',
            examples: [
                'Either party may terminate this Agreement upon thirty (30) days written notice...',
                'The Company may terminate this Agreement immediately if Contractor breaches...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Create governing law clause pattern
     */
    createGoverningLawPattern() {
        return {
            id: 'governing-law-001',
            name: 'Governing Law Clause',
            description: 'Identifies governing law clauses in contracts',
            regex: /\b(?:governing\s+law|governed\s+by|jurisdiction|applicable\s+law)\b/i,
            keyPhrases: [
                'governing law',
                'governed by',
                'jurisdiction',
                'applicable law',
                'laws of the state',
                'shall be governed by',
                'subject to the laws'
            ],
            priority: 7,
            type: 'GOVERNING_LAW',
            subtype: 'GENERAL',
            examples: [
                'This Agreement shall be governed by and construed in accordance with the laws of the State of...',
                'The laws of New York shall govern this Agreement without regard to its conflict of laws principles...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Create force majeure clause pattern
     */
    createForceMatjeurePattern() {
        return {
            id: 'force-majeure-001',
            name: 'Force Majeure Clause',
            description: 'Identifies force majeure clauses in contracts',
            regex: /\b(?:force\s+majeure|act\s+of\s+god|beyond\s+(?:the\s+)?control|unforeseeable)\b/i,
            keyPhrases: [
                'force majeure',
                'act of god',
                'beyond control',
                'unforeseeable',
                'circumstances beyond',
                'acts of nature',
                'natural disaster'
            ],
            priority: 6,
            type: 'FORCE_MAJEURE',
            subtype: 'GENERAL',
            examples: [
                'Neither party shall be liable for any failure to perform due to causes beyond its reasonable control...',
                'Force Majeure events include, but are not limited to, acts of God, fire, flood, earthquake...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Create dispute resolution clause pattern
     */
    createDisputeResolutionPattern() {
        return {
            id: 'dispute-resolution-001',
            name: 'Dispute Resolution Clause',
            description: 'Identifies dispute resolution clauses in contracts',
            regex: /\b(?:dispute|arbitration|mediation|resolution|settle|resolve)\b/i,
            keyPhrases: [
                'dispute resolution',
                'arbitration',
                'mediation',
                'resolve disputes',
                'settlement',
                'alternative dispute resolution',
                'binding arbitration'
            ],
            priority: 7,
            type: 'DISPUTE_RESOLUTION',
            subtype: 'GENERAL',
            examples: [
                'Any dispute arising out of or relating to this Agreement shall be resolved by binding arbitration...',
                'The parties agree to mediate any dispute before resorting to arbitration or litigation...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Create assignment clause pattern
     */
    createAssignmentPattern() {
        return {
            id: 'assignment-001',
            name: 'Assignment Clause',
            description: 'Identifies assignment clauses in contracts',
            regex: /\b(?:assign|assignment|transfer|delegate|delegation)\b/i,
            keyPhrases: [
                'assignment',
                'assign',
                'may not assign',
                'no assignment',
                'transfer rights',
                'delegate',
                'delegation of duties'
            ],
            priority: 6,
            type: 'ASSIGNMENT',
            subtype: 'GENERAL',
            examples: [
                'This Agreement may not be assigned by either party without the prior written consent of the other party...',
                'Customer may not assign its rights or obligations under this Agreement without Supplier\'s consent...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Create intellectual property clause pattern
     */
    createIntellectualPropertyPattern() {
        return {
            id: 'intellectual-property-001',
            name: 'Intellectual Property Clause',
            description: 'Identifies intellectual property clauses in contracts',
            regex: /\b(?:intellectual\s+property|patent|copyright|trademark|trade\s+secret|ownership|proprietary\s+right)\b/i,
            keyPhrases: [
                'intellectual property',
                'patent',
                'copyright',
                'trademark',
                'trade secret',
                'ownership',
                'proprietary rights',
                'license grant'
            ],
            priority: 9,
            type: 'INTELLECTUAL_PROPERTY',
            subtype: 'GENERAL',
            examples: [
                'All intellectual property rights in and to the Software shall remain the property of the Company...',
                'Supplier grants Customer a non-exclusive license to use the intellectual property...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Create non-compete clause pattern
     */
    createNonCompetePattern() {
        return {
            id: 'non-compete-001',
            name: 'Non-Compete Clause',
            description: 'Identifies non-compete clauses in contracts',
            regex: /\b(?:non-compete|noncompete|not\s+compete|covenant\s+not\s+to\s+compete|competitive|competing)\b/i,
            keyPhrases: [
                'non-compete',
                'noncompete',
                'not compete',
                'covenant not to compete',
                'competitive activity',
                'competing business',
                'restriction on competition'
            ],
            priority: 8,
            type: 'NON_COMPETE',
            subtype: 'GENERAL',
            examples: [
                'Employee agrees not to compete with the Company for a period of one year after termination...',
                'Consultant shall not engage in any competitive business during the term of this Agreement...'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    /**
     * Process an analyzed document to detect clauses
     * @param analysis Document analysis
     */
    async processAnalyzedDocument(analysis) {
        try {
            // We received a document analysis event, extract the document text from the structure
            let documentText = '';
            for (const section of analysis.structure.sections) {
                documentText += section.title + '\n' + section.content + '\n\n';
            }
            // Detect clauses in the document
            const result = await this.detectClauses(documentText);
            // Publish clause detection result
            this.eventBus.publish('clause.detected', result);
        }
        catch (error) {
            this.logger.error('Failed to process analyzed document', error);
        }
    }
    /**
     * Detect clauses in a document
     * @param document Document text
     * @returns Clause detection result
     */
    async detectClauses(document) {
        this.logger.info('Detecting clauses in document');
        try {
            const startTime = Date.now();
            // Initialize result
            const result = {
                clauses: [],
                patterns: this.patterns,
                statistics: {
                    totalClauses: 0,
                    typeDistribution: {},
                    averageConfidence: 0,
                    detectionTime: 0
                }
            };
            // Detect clauses using patterns
            const detectedClauses = await this.detectClausesWithPatterns(document);
            // Classify clauses
            const classifiedClauses = await this.classifyClauses(detectedClauses, document);
            // Set clauses
            result.clauses = classifiedClauses;
            // Calculate statistics
            result.statistics.totalClauses = classifiedClauses.length;
            result.statistics.detectionTime = Date.now() - startTime;
            // Calculate type distribution
            const typeDistribution = {};
            let totalConfidence = 0;
            for (const clause of classifiedClauses) {
                typeDistribution[clause.type] = (typeDistribution[clause.type] || 0) + 1;
                totalConfidence += clause.confidence;
            }
            result.statistics.typeDistribution = typeDistribution;
            result.statistics.averageConfidence = classifiedClauses.length > 0
                ? totalConfidence / classifiedClauses.length
                : 0;
            this.logger.info(`Detected ${result.statistics.totalClauses} clauses in ${result.statistics.detectionTime}ms`);
            return result;
        }
        catch (error) {
            this.logger.error('Clause detection failed', error);
            throw new Error(`Clause detection failed: ${error.message}`);
        }
    }
    /**
     * Detect clauses using patterns
     * @param document Document text
     * @returns Array of detected clauses
     */
    async detectClausesWithPatterns(document) {
        const detectedClauses = [];
        // Sort patterns by priority
        const sortedPatterns = [...this.patterns].sort((a, b) => b.priority - a.priority);
        for (const pattern of sortedPatterns) {
            // Check if document contains any of the key phrases
            const containsKeyPhrase = pattern.keyPhrases.some(phrase => document.toLowerCase().includes(phrase.toLowerCase()));
            if (!containsKeyPhrase) {
                continue;
            }
            // Find matches using regex
            const regex = pattern.regex instanceof RegExp
                ? pattern.regex
                : new RegExp(pattern.regex, 'gi');
            let match;
            while ((match = regex.exec(document)) !== null) {
                // Find a reasonable chunk of text around the match
                const matchPosition = match.index;
                const matchText = match[0];
                // Look for paragraph boundaries
                const paragraphStart = document.lastIndexOf('\n\n', matchPosition);
                const paragraphEnd = document.indexOf('\n\n', matchPosition + matchText.length);
                const start = paragraphStart !== -1 ? paragraphStart + 2 : Math.max(0, matchPosition - 100);
                const end = paragraphEnd !== -1 ? paragraphEnd : Math.min(document.length, matchPosition + matchText.length + 400);
                const text = document.substring(start, end).trim();
                // Calculate a basic confidence score based on the number of key phrases
                const keyPhraseCount = pattern.keyPhrases.filter(phrase => text.toLowerCase().includes(phrase.toLowerCase())).length;
                const confidence = Math.min(0.5 + (keyPhraseCount / pattern.keyPhrases.length) * 0.5, 0.95);
                // Generate a unique ID
                const id = `clause-${pattern.type.toLowerCase()}-${Date.now()}-${detectedClauses.length}`;
                detectedClauses.push({
                    id,
                    type: pattern.type,
                    subtype: pattern.subtype,
                    text,
                    startPosition: start,
                    endPosition: end,
                    confidence,
                    importance: pattern.priority / 10, // Normalize to 0-1 scale
                    context: document.substring(Math.max(0, start - 100), Math.min(document.length, end + 100)),
                    patternMatched: pattern.id,
                    classification: {
                        type: pattern.type,
                        subtype: pattern.subtype,
                        confidence,
                        alternativeTypes: []
                    },
                    metadata: {
                        patternName: pattern.name,
                        matchedPhrase: matchText
                    }
                });
            }
        }
        return detectedClauses;
    }
    /**
     * Classify clauses using AI
     * @param clauses Detected clauses
     * @param document Full document text
     * @returns Classified clauses
     */
    async classifyClauses(clauses, document) {
        // In a real implementation, this would use AI to refine the classification
        // For this example, we'll just refine the confidence and add alternative types
        // Use document analyzer if available
        let documentAnalysis = null;
        try {
            // Try to get a comprehensive analysis of the document
            documentAnalysis = await this.documentAnalyzer.analyzeDocument(document, 'COMPREHENSIVE');
        }
        catch (error) {
            this.logger.warn('Failed to get document analysis for clause classification', error);
            documentAnalysis = null;
        }
        // Enhance clauses with AI classification
        for (const clause of clauses) {
            // In a real implementation, this would use AI to classify the clause
            // For this example, we'll simulate it
            // If we have document analysis, try to find overlapping clauses
            if (documentAnalysis) {
                const overlappingClauses = documentAnalysis.structure.clauses.filter(analysisClause => {
                    // Check if the clauses overlap
                    return ((clause.startPosition <= analysisClause.endPosition &&
                        clause.endPosition >= analysisClause.startPosition) ||
                        clause.text.includes(analysisClause.text) ||
                        analysisClause.text.includes(clause.text));
                });
                if (overlappingClauses.length > 0) {
                    // Use the most important overlapping clause for classification
                    const mostImportantClause = overlappingClauses.reduce((prev, curr) => (curr.importance > prev.importance ? curr : prev), overlappingClauses[0]);
                    // Update the classification
                    clause.classification.type = mostImportantClause.type;
                    clause.classification.confidence = Math.min(clause.classification.confidence + 0.15, 0.98);
                    // Add alternative types
                    clause.classification.alternativeTypes = [
                        {
                            type: clause.type, // Original type
                            confidence: clause.classification.confidence - 0.1
                        }
                    ];
                    // Update clause type and subtype
                    clause.type = mostImportantClause.type;
                    clause.subtype = 'GENERAL'; // Default subtype
                }
            }
            // Generate alternative classifications
            if (clause.classification.alternativeTypes.length === 0) {
                // Generate 1-2 alternative types
                const alternativeCount = 1 + Math.floor(Math.random() * 2);
                const possibleTypes = this.getPossibleAlternativeTypes(clause.type);
                for (let i = 0; i < alternativeCount && i < possibleTypes.length; i++) {
                    clause.classification.alternativeTypes.push({
                        type: possibleTypes[i],
                        confidence: clause.classification.confidence - 0.2 - (0.1 * i)
                    });
                }
            }
        }
        return clauses;
    }
    /**
     * Get possible alternative types for a clause type
     * @param type Clause type
     * @returns Array of possible alternative types
     */
    getPossibleAlternativeTypes(type) {
        const allTypes = [
            'INDEMNIFICATION',
            'LIMITATION_OF_LIABILITY',
            'WARRANTY',
            'TERMINATION',
            'GOVERNING_LAW',
            'CONFIDENTIALITY',
            'NON_COMPETE',
            'PAYMENT_TERMS',
            'INTELLECTUAL_PROPERTY',
            'DISPUTE_RESOLUTION',
            'FORCE_MAJEURE',
            'ASSIGNMENT',
            'AMENDMENT',
            'NOTICE',
            'SEVERABILITY',
            'ENTIRE_AGREEMENT'
        ];
        // Return types that are not the given type
        return allTypes.filter(t => t !== type);
    }
    /**
     * Dispose the clause detector
     */
    dispose() {
        this.eventBus.unsubscribe('document.analyzed', 'clause-detector-analyzed');
        this.eventBus.unsubscribe('clause.detect', 'clause-detector-detect');
    }
}
exports.ClauseDetector = ClauseDetector;
//# sourceMappingURL=clauseDetector.js.map