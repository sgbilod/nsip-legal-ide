/**
 * Adaptive Document Intelligence
 *
 * This module provides self-improving document generation capabilities
 * through continuous learning and feedback processing.
 */
import { LegalDocument, UserFeedback, FeedbackHistory, ImprovedDocument } from './interfaces';
import { IService } from '../core/interfaces';
import { ServiceRegistry } from '../core/serviceRegistry';
import { EventBus } from '../core/eventBus';
import { Logger } from '../core/logger';
/**
 * Adaptive Document AI implementation
 *
 * Provides self-improving document generation through continuous
 * learning from user feedback.
 */
export declare class AdaptiveDocumentAI implements IService {
    private learningPipeline;
    private feedbackProcessor;
    private logger;
    private eventBus;
    private serviceRegistry;
    constructor(logger: Logger, eventBus: EventBus, serviceRegistry: ServiceRegistry);
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Dispose the service resources
     */
    dispose(): Promise<void>;
    /**
     * Improve a document based on user feedback
     *
     * @param documentId Document ID to improve
     * @param feedback User feedback to incorporate
     */
    improveFromFeedback(documentId: string, feedback: UserFeedback): Promise<void>;
    /**
     * Generate an improved version of a document based on feedback history
     *
     * @param original Original document
     * @param feedback Feedback history
     * @returns Improved document
     */
    generateImprovedVersion(original: LegalDocument, feedback: FeedbackHistory): Promise<ImprovedDocument>;
    /**
     * Update feature importance based on feedback
     */
    private updateFeatureImportance;
    /**
     * Retrain specific model components
     */
    private retrainModel;
    /**
     * A/B test improvements to validate changes
     */
    private abTestImprovement;
    /**
     * Analyze feedback history to determine patterns
     */
    private analyzeFeedback;
    /**
     * Calculate how frequently specific issues appear in feedback
     */
    private calculateIssueFrequency;
    /**
     * Calculate average scores for different document sections
     */
    private calculateSectionScores;
    /**
     * Identify user preferences from feedback patterns
     */
    private identifyUserPreferences;
    /**
     * Generate a document variation with specific settings
     */
    private generateVariation;
    /**
     * Transform document content based on variation style
     */
    private transformContent;
    /**
     * Score document variations based on feedback analysis
     */
    private scoreVariations;
    /**
     * Select the best document variation based on scores
     */
    private selectBestVariation;
    /**
     * Apply final optimizations to the document
     */
    private optimizeDocument;
    /**
     * Event handler for document feedback events
     */
    private handleDocumentFeedback;
}
export declare function createAdaptiveDocumentAI(logger: Logger, eventBus: EventBus, serviceRegistry: ServiceRegistry): AdaptiveDocumentAI;
