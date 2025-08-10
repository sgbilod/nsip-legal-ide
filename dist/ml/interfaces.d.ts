/**
 * Core interfaces for AI/ML models and advanced features
 */
export type FeatureVector = {
    names: string[];
    values: number[];
    metadata: Record<string, any>;
};
export type Prediction = {
    class: string;
    probabilities: number[] | Float32Array;
    metadata?: Record<string, any>;
};
export type Confidence = {
    mean: number;
    lower: number;
    upper: number;
    distribution?: number[];
};
export interface LegalCase {
    id: string;
    type: 'litigation' | 'contract' | 'regulatory' | 'ip' | string;
    title: string;
    description: string;
    parties: Party[];
    documents: LegalDocument[];
    jurisdiction: Jurisdiction;
    filingDate?: Date;
    status: CaseStatus;
    relatedLaws: string[];
    metadata: Record<string, any>;
}
export interface Party {
    id: string;
    name: string;
    role: 'plaintiff' | 'defendant' | 'appellant' | 'respondent' | string;
    type: 'individual' | 'organization' | 'government';
    metadata: Record<string, any>;
}
export type CaseStatus = 'pending' | 'active' | 'settled' | 'dismissed' | 'decided' | string;
export interface Jurisdiction {
    country: string;
    region?: string;
    court?: string;
    type: 'federal' | 'state' | 'local' | 'international';
}
export interface LegalDocument {
    id: string;
    title: string;
    content: string;
    type: DocumentType;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    authors: string[];
    status: 'draft' | 'final' | 'executed' | 'archived';
}
export type DocumentType = 'contract' | 'pleading' | 'motion' | 'brief' | 'opinion' | 'regulation' | 'statute' | 'agreement' | string;
export interface ImprovedDocument extends LegalDocument {
    improvements: DocumentImprovement[];
    optimizationScore: number;
    generationVersion: string;
    aiContributions: AiContribution[];
}
export interface DocumentImprovement {
    type: 'clarity' | 'compliance' | 'risk-mitigation' | 'language' | string;
    description: string;
    before: string;
    after: string;
    confidence: number;
}
export interface AiContribution {
    model: string;
    section: string;
    contribution: string;
    confidence: number;
}
export interface OutcomePrediction {
    outcome: string;
    probability: number;
    confidenceInterval: [number, number];
    keyFactors: PredictionFactor[];
    similarCases: SimilarCase[];
    recommendations: Recommendation[];
}
export interface PredictionFactor {
    name: string;
    influence: number;
    description: string;
    evidence: string[];
}
export interface SimilarCase {
    id: string;
    title: string;
    similarity: number;
    outcome: string;
    relevantFacts: string[];
}
export interface Recommendation {
    action: string;
    impact: number;
    effort: 'low' | 'medium' | 'high';
    description: string;
    timeframe: string;
}
export interface UserFeedback {
    userId: string;
    documentId: string;
    timestamp: Date;
    rating: number;
    comments: string;
    sections: SectionFeedback[];
    usageContext: string;
    accepted: boolean;
}
export interface SectionFeedback {
    section: string;
    rating: number;
    comments: string;
    suggested?: string;
}
export interface FeedbackHistory {
    documentType: string;
    feedbacks: UserFeedback[];
    aggregateScore: number;
    trend: 'improving' | 'stable' | 'declining';
    commonIssues: string[];
}
export interface ProcessedFeedback {
    key: string;
    sentiment: number;
    requiresRetraining: boolean;
    affectedComponents: string[];
    suggestedImprovements: string[];
}
export interface WorkflowRequirements {
    name: string;
    description: string;
    steps: string[];
    participants: string[];
    documents: string[];
    deadlines: Record<string, Date>;
    constraints: WorkflowConstraint[];
    priorities: ('time' | 'cost' | 'quality')[];
}
export interface WorkflowConstraint {
    type: 'regulatory' | 'time' | 'resource' | 'dependency';
    description: string;
    value: any;
}
export interface Workflow {
    id: string;
    name: string;
    steps: WorkflowStep[];
    participants: WorkflowParticipant[];
    status: 'draft' | 'active' | 'completed' | 'failed';
    progress: number;
    metrics: WorkflowMetrics;
}
export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    assignee: string;
    status: 'pending' | 'in-progress' | 'completed' | 'blocked';
    dependencies: string[];
    estimatedDuration: number;
    actualDuration?: number;
    documents: string[];
}
export interface WorkflowParticipant {
    id: string;
    name: string;
    role: string;
    email: string;
    workload: number;
}
export interface WorkflowMetrics {
    totalTime: number;
    stepTimes: Record<string, number>;
    bottlenecks: string[];
    efficiency: number;
    qualityScore: number;
    history: WorkflowHistory[];
}
export interface WorkflowHistory {
    timestamp: Date;
    event: string;
    step: string;
    duration: number;
    actor: string;
    metadata: Record<string, any>;
}
export interface AdaptiveWorkflow extends Workflow {
    adaptiveTriggers: {
        onDelayDetected: (delay: number) => Promise<void>;
        onErrorRate: (rate: number) => Promise<void>;
        onUserFeedback: (feedback: UserFeedback) => Promise<void>;
    };
    optimizationHistory: WorkflowOptimization[];
}
export interface WorkflowOptimization {
    timestamp: Date;
    trigger: string;
    changes: string[];
    impact: {
        timeReduction: number;
        qualityImprovement: number;
        costReduction: number;
    };
}
export interface OptimizedWorkflow extends Workflow {
    improvements: WorkflowImprovement[];
    projectedMetrics: WorkflowMetrics;
}
export interface WorkflowImprovement {
    stepId: string;
    type: 'reorder' | 'parallelize' | 'automate' | 'reassign' | 'eliminate';
    description: string;
    impact: {
        time: number;
        cost: number;
        quality: number;
    };
}
export interface BusinessContext {
    organization: {
        id: string;
        name: string;
        industry: string;
        size: 'small' | 'medium' | 'large' | 'enterprise';
        jurisdictions: string[];
    };
    transaction: {
        value: number;
        currency: string;
        type: string;
        parties: string[];
    };
    regulatory: {
        frameworks: string[];
        recentChanges: string[];
        upcomingChanges: string[];
    };
}
export interface RiskAssessment {
    overallScore: number;
    dimensions: RiskDimension[];
    correlations: RiskCorrelation[];
    compoundRisks: CompoundRisk[];
    mitigations: RiskMitigation[];
    heatMap: RiskHeatMap;
    monitoringPlan: RiskMonitoringPlan;
}
export interface RiskDimension {
    type: string;
    assessment: {
        score: number;
        confidence: number;
        factors: RiskFactor[];
        projectedTrend: 'increasing' | 'stable' | 'decreasing';
    };
}
export interface RiskFactor {
    name: string;
    impact: number;
    likelihood: number;
    description: string;
    source: string;
}
export interface RiskCorrelation {
    source: string;
    target: string;
    strength: number;
    description: string;
}
export interface CompoundRisk {
    name: string;
    components: string[];
    amplification: number;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}
export interface RiskMitigation {
    risk: string;
    strategy: 'avoid' | 'transfer' | 'mitigate' | 'accept';
    actions: string[];
    costEstimate: number;
    effectivenessEstimate: number;
    timeframe: string;
    responsibleParty: string;
}
export interface RiskHeatMap {
    dimensions: string[];
    scores: number[][];
    hotspots: {
        x: number;
        y: number;
        severity: number;
        description: string;
    }[];
}
export interface RiskMonitoringPlan {
    schedule: {
        frequency: string;
        nextReview: Date;
    };
    indicators: {
        name: string;
        threshold: number;
        currentValue: number;
        source: string;
    }[];
    automatedAlerts: string[];
    responsibleParties: string[];
}
export interface Organization {
    id: string;
    name: string;
    type: string;
    industry: string[];
    size: number;
    jurisdictions: string[];
    regulatoryFrameworks: string[];
    subsidiaries: string[];
    publiclyTraded: boolean;
    riskProfile: string;
}
export interface CompliancePrediction {
    currentCompliance: number;
    predictedCompliance: number;
    highRiskAreas: ComplianceRiskArea[];
    recommendations: ComplianceRecommendation[];
    timeline: ComplianceTimeline;
    costEstimate: ComplianceCostEstimate;
}
export interface ComplianceRiskArea {
    area: string;
    framework: string;
    riskScore: number;
    impactDescription: string;
    deadline: Date;
    complexity: 'low' | 'medium' | 'high';
}
export interface ComplianceRecommendation {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    steps: string[];
    impact: number;
    deadline: Date;
}
export interface ComplianceTimeline {
    events: {
        date: Date;
        description: string;
        importance: 'low' | 'medium' | 'high';
        type: 'regulatory' | 'internal' | 'deadline' | 'review';
    }[];
    criticalPath: Date[];
}
export interface ComplianceCostEstimate {
    total: number;
    breakdown: {
        category: string;
        amount: number;
        description: string;
    }[];
    scenarios: {
        best: number;
        expected: number;
        worst: number;
    };
    roi: number;
}
export interface QuantumSecureDocument {
    encrypted: {
        ciphertext: string;
        parameters: any;
    };
    signature: string;
    proof: BlockchainProof;
    algorithm: string;
    keyId: string;
}
export interface BlockchainProof {
    network: string;
    transactionId: string;
    timestamp: Date;
    blockHeight: number;
    merkleRoot: string;
    merkleProof: string[];
}
export interface LitigationOutcomeModel {
    predict(features: FeatureVector): Promise<Prediction>;
}
export interface ContractPerformanceModel {
    predict(features: FeatureVector): Promise<Prediction>;
}
export interface RegulatoryComplianceModel {
    predict(features: FeatureVector): Promise<Prediction>;
}
export interface IPSuccessModel {
    predict(features: FeatureVector): Promise<Prediction>;
}
export interface ContinuousLearningPipeline {
    process(data: any): Promise<void>;
    getStatus(): Promise<any>;
}
export interface FeedbackProcessor {
    process(feedback: UserFeedback): Promise<ProcessedFeedback>;
}
export interface WorkflowAI {
    generate(params: any): Promise<AdaptiveWorkflow>;
}
export interface ProcessOptimizer {
    suggest(params: any): Promise<WorkflowImprovement[]>;
}
export interface LegalRiskModel {
    assess(document: LegalDocument, context: BusinessContext): Promise<any>;
}
export interface FinancialRiskModel {
    assess(document: LegalDocument, context: BusinessContext): Promise<any>;
}
export interface ReputationalRiskModel {
    assess(document: LegalDocument, context: BusinessContext): Promise<any>;
}
export interface OperationalRiskModel {
    assess(document: LegalDocument, context: BusinessContext): Promise<any>;
}
export interface ComplianceRiskModel {
    assess(document: LegalDocument, context: BusinessContext): Promise<any>;
}
export interface ComplianceAI {
    predictImpacts(params: any): Promise<ComplianceRiskArea[]>;
}
export interface RegulatoryTracker {
    getUpcomingChanges(jurisdictions: string[]): Promise<any[]>;
}
