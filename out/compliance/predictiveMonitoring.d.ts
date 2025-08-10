/**
 * Predictive Compliance Monitoring
 *
 * This module provides AI-driven compliance prediction and monitoring
 * to proactively identify and address potential compliance issues.
 */
import { Organization, CompliancePrediction } from '../ml/interfaces';
import { IService } from '../core/interfaces';
import { ServiceRegistry } from '../core/serviceRegistry';
import { EventBus } from '../core/eventBus';
import { Logger } from '../core/logger';
/**
 * Predictive Compliance Monitor implementation
 *
 * Provides AI-driven compliance prediction and monitoring
 * to proactively identify and address potential compliance issues.
 */
export declare class PredictiveComplianceMonitor implements IService {
    private complianceAI;
    private regulatoryTracker;
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
     * Predict compliance issues for an organization
     *
     * @param organization Organization to analyze
     * @returns Compliance prediction
     */
    predictComplianceIssues(organization: Organization): Promise<CompliancePrediction>;
    /**
     * Analyze current compliance state
     */
    private analyzeCurrentCompliance;
    /**
     * Generate proactive compliance recommendations
     */
    private generateProactiveSteps;
    /**
     * Generate compliance steps for a risk area
     */
    private generateComplianceSteps;
    /**
     * Predict future compliance score
     */
    private predictFutureScore;
    /**
     * Create a compliance timeline
     */
    private createComplianceTimeline;
    /**
     * Estimate compliance cost
     */
    private estimateComplianceCost;
    /**
     * Event handler for organization updated events
     */
    private handleOrganizationUpdated;
}
export declare function createPredictiveComplianceMonitor(logger: Logger, eventBus: EventBus, serviceRegistry: ServiceRegistry): PredictiveComplianceMonitor;
