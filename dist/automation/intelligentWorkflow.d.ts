/**
 * Intelligent Workflow Engine
 *
 * This module provides AI-driven workflow automation with self-optimizing
 * capabilities for legal processes.
 */
import { WorkflowRequirements, AdaptiveWorkflow, Workflow, WorkflowMetrics, OptimizedWorkflow } from '../ml/interfaces';
import { IService } from '../core/interfaces';
import { ServiceRegistry } from '../core/serviceRegistry';
import { EventBus } from '../core/eventBus';
import { Logger } from '../core/logger';
/**
 * Intelligent Workflow Engine implementation
 *
 * Provides AI-driven workflow automation with self-optimizing
 * capabilities for legal processes.
 */
export declare class IntelligentWorkflowEngine implements IService {
    private workflowAI;
    private processOptimizer;
    private logger;
    private eventBus;
    private serviceRegistry;
    private activeWorkflows;
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
     * Create an adaptive workflow based on requirements
     *
     * @param requirements Workflow requirements
     * @returns An adaptive workflow
     */
    createAdaptiveWorkflow(requirements: WorkflowRequirements): Promise<AdaptiveWorkflow>;
    /**
     * Optimize an existing workflow based on metrics
     *
     * @param workflow Workflow to optimize
     * @param metrics Workflow metrics
     * @returns An optimized workflow
     */
    optimizeExistingWorkflow(workflow: Workflow, metrics: WorkflowMetrics): Promise<OptimizedWorkflow>;
    /**
     * Find similar workflows for learning
     */
    private findSimilarWorkflows;
    /**
     * Extract success patterns from similar workflows
     */
    private extractSuccessPatterns;
    /**
     * Optimize a workflow for speed when delay detected
     */
    private optimizeForSpeed;
    /**
     * Add validation steps when error rate is high
     */
    private addValidationSteps;
    /**
     * Adapt workflow based on user feedback
     */
    private adaptToFeedback;
    /**
     * Identify bottlenecks in a workflow
     */
    private identifyBottlenecks;
    /**
     * Simulate optimizations to evaluate impact
     */
    private simulateOptimizations;
    /**
     * Apply optimizations to a workflow
     */
    private applyOptimizations;
    /**
     * Apply a specific improvement to a workflow
     */
    private applyImprovement;
    /**
     * Event handler for workflow feedback events
     */
    private handleWorkflowFeedback;
}
export declare function createIntelligentWorkflowEngine(logger: Logger, eventBus: EventBus, serviceRegistry: ServiceRegistry): IntelligentWorkflowEngine;
