/**
 * Advanced Risk Assessment
 *
 * This module provides multi-dimensional risk analysis for legal documents
 * and business contexts.
 */
import { LegalDocument, BusinessContext, RiskAssessment } from '../ml/interfaces';
import { IService } from '../core/interfaces';
import { ServiceRegistry } from '../core/serviceRegistry';
import { EventBus } from '../core/eventBus';
import { Logger } from '../core/logger';
/**
 * Advanced Risk Assessment implementation
 *
 * Provides comprehensive multi-dimensional risk analysis for legal
 * documents and business contexts.
 */
export declare class AdvancedRiskAssessment implements IService {
    private riskModels;
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
     * Assess comprehensive risk for a document in a business context
     *
     * @param document Legal document to assess
     * @param context Business context
     * @returns Comprehensive risk assessment
     */
    assessComprehensiveRisk(document: LegalDocument, context: BusinessContext): Promise<RiskAssessment>;
    /**
     * Calculate correlations between risk dimensions
     */
    private calculateRiskCorrelations;
    /**
     * Generate a description for a risk correlation
     */
    private generateCorrelationDescription;
    /**
     * Identify compound risks from dimensions and correlations
     */
    private identifyCompoundRisks;
    /**
     * Generate mitigation strategies for risks
     */
    private generateMitigationStrategies;
    /**
     * Determine the appropriate mitigation strategy for a risk
     */
    private determineMitigationStrategy;
    /**
     * Generate mitigation actions for a risk
     */
    private generateMitigationActions;
    /**
     * Determine the responsible party for a risk
     */
    private determineResponsibleParty;
    /**
     * Generate a risk heat map
     */
    private generateRiskHeatMap;
    /**
     * Create a risk monitoring plan
     */
    private createMonitoringPlan;
    /**
     * Calculate overall risk score
     */
    private calculateOverallRisk;
    /**
     * Event handler for document updated events
     */
    private handleDocumentUpdated;
}
export declare function createAdvancedRiskAssessment(logger: Logger, eventBus: EventBus, serviceRegistry: ServiceRegistry): AdvancedRiskAssessment;
