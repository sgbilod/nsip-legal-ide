/**
 * Advanced Features Module Registry
 * 
 * This module integrates all the advanced AI/ML and automation components
 * and provides a centralized registration and access point.
 */

import { IService } from '../core/interfaces';
import { ServiceRegistry } from '../core/serviceRegistry';
import { EventBus } from '../core/eventBus';
import { Logger } from '../core/logger';

// Import advanced feature services
import { LegalOutcomePredictor } from '../ml/outcomePredictor';
import { createAdaptiveDocumentAI } from '../ml/adaptiveIntelligence';
import { createIntelligentWorkflowEngine } from '../automation/intelligentWorkflow';
import { createAdvancedRiskAssessment } from '../risk/advancedRiskAssessment';
import { createPredictiveComplianceMonitor } from '../compliance/predictiveMonitoring';
import { createQuantumResistantSecurity } from '../security/quantumResistant';

/**
 * Advanced Features Registry
 * 
 * Provides centralized management for all advanced AI/ML and automation
 * features in the NSIP Legal/Business IDE.
 */
export class AdvancedFeaturesRegistry implements IService {
    private logger: Logger;
    private eventBus: EventBus;
    private serviceRegistry: ServiceRegistry;
    
    private services: Map<string, IService>;
    private initialized: boolean;
    
    constructor(
        logger: Logger,
        eventBus: EventBus,
        serviceRegistry: ServiceRegistry
    ) {
        this.logger = logger;
        this.eventBus = eventBus;
        this.serviceRegistry = serviceRegistry;
        
        this.services = new Map<string, IService>();
        this.initialized = false;
    }
    
    /**
     * Initialize all advanced features
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }
        
        this.logger.info('AdvancedFeaturesRegistry: Initializing advanced features');
        
        try {
            // Create services
            this.logger.debug('AdvancedFeaturesRegistry: Creating services');
            
            // Create and register legal outcome predictor
            const outcomePredictor = new LegalOutcomePredictor();
            this.registerService('outcomePredictor', outcomePredictor);
            
            // Create and register adaptive document AI
            const adaptiveDocumentAI = createAdaptiveDocumentAI(
                this.logger,
                this.eventBus,
                this.serviceRegistry
            );
            this.registerService('adaptiveDocumentAI', adaptiveDocumentAI);
            
            // Create and register intelligent workflow engine
            const workflowEngine = createIntelligentWorkflowEngine(
                this.logger,
                this.eventBus,
                this.serviceRegistry
            );
            this.registerService('workflowEngine', workflowEngine);
            
            // Create and register advanced risk assessment
            const riskAssessment = createAdvancedRiskAssessment(
                this.logger,
                this.eventBus,
                this.serviceRegistry
            );
            this.registerService('riskAssessment', riskAssessment);
            
            // Create and register predictive compliance monitor
            const complianceMonitor = createPredictiveComplianceMonitor(
                this.logger,
                this.eventBus,
                this.serviceRegistry
            );
            this.registerService('complianceMonitor', complianceMonitor);
            
            // Create and register quantum-resistant security
            const quantumSecurity = createQuantumResistantSecurity(
                this.logger,
                this.eventBus,
                this.serviceRegistry
            );
            this.registerService('quantumSecurity', quantumSecurity);
            
            // Initialize all services
            this.logger.debug('AdvancedFeaturesRegistry: Initializing services');
            await Promise.all(
                Array.from(this.services.entries()).map(
                    async ([name, service]) => {
                        try {
                            await service.initialize();
                            this.logger.debug(`AdvancedFeaturesRegistry: Initialized ${name}`);
                        } catch (error) {
                            this.logger.error(`AdvancedFeaturesRegistry: Failed to initialize ${name}`, {
                                error
                            });
                            throw error;
                        }
                    }
                )
            );
            
            // Register this registry with the global service registry
            this.serviceRegistry.register('advancedFeatures', this);
            
            this.initialized = true;
            this.logger.info('AdvancedFeaturesRegistry: All advanced features initialized successfully');
            
            // Emit initialization event
            this.eventBus.emit('advancedFeatures:initialized', {
                serviceCount: this.services.size
            });
        } catch (error) {
            this.logger.error('AdvancedFeaturesRegistry: Initialization failed', {
                error
            });
            throw error;
        }
    }
    
    /**
     * Dispose all advanced features
     */
    async dispose(): Promise<void> {
        if (!this.initialized) {
            return;
        }
        
        this.logger.info('AdvancedFeaturesRegistry: Disposing advanced features');
        
        try {
            // Dispose all services
            await Promise.all(
                Array.from(this.services.entries()).map(
                    async ([name, service]) => {
                        try {
                            await service.dispose();
                            this.logger.debug(`AdvancedFeaturesRegistry: Disposed ${name}`);
                        } catch (error) {
                            this.logger.error(`AdvancedFeaturesRegistry: Failed to dispose ${name}`, {
                                error
                            });
                            // Continue with other services even if one fails
                        }
                    }
                )
            );
            
            // Clear services
            this.services.clear();
            
            // Unregister from global service registry
            this.serviceRegistry.unregister('advancedFeatures');
            
            this.initialized = false;
            this.logger.info('AdvancedFeaturesRegistry: All advanced features disposed successfully');
            
            // Emit disposal event
            this.eventBus.emit('advancedFeatures:disposed', {});
        } catch (error) {
            this.logger.error('AdvancedFeaturesRegistry: Disposal failed', {
                error
            });
            throw error;
        }
    }
    
    /**
     * Get a specific advanced feature service
     * 
     * @param name Service name
     * @returns The service instance or null if not found
     */
    getService<T extends IService>(name: string): T | null {
        const service = this.services.get(name);
        return service as T || null;
    }
    
    /**
     * Register a service
     * 
     * @param name Service name
     * @param service Service instance
     */
    private registerService(name: string, service: IService): void {
        this.logger.debug(`AdvancedFeaturesRegistry: Registering service ${name}`);
        this.services.set(name, service);
    }
}

// Export factory function to create the registry
export function createAdvancedFeaturesRegistry(
    logger: Logger,
    eventBus: EventBus,
    serviceRegistry: ServiceRegistry
): AdvancedFeaturesRegistry {
    return new AdvancedFeaturesRegistry(logger, eventBus, serviceRegistry);
}
