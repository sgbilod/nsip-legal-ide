"use strict";
/**
 * Advanced Features Module Registry
 *
 * This module integrates all the advanced AI/ML and automation components
 * and provides a centralized registration and access point.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedFeaturesRegistry = void 0;
exports.createAdvancedFeaturesRegistry = createAdvancedFeaturesRegistry;
// Import advanced feature services
const outcomePredictor_1 = require("../ml/outcomePredictor");
const adaptiveIntelligence_1 = require("../ml/adaptiveIntelligence");
const intelligentWorkflow_1 = require("../automation/intelligentWorkflow");
const advancedRiskAssessment_1 = require("../risk/advancedRiskAssessment");
const predictiveMonitoring_1 = require("../compliance/predictiveMonitoring");
const quantumResistant_1 = require("../security/quantumResistant");
/**
 * Advanced Features Registry
 *
 * Provides centralized management for all advanced AI/ML and automation
 * features in the NSIP Legal/Business IDE.
 */
class AdvancedFeaturesRegistry {
    constructor(logger, eventBus, serviceRegistry) {
        this.logger = logger;
        this.eventBus = eventBus;
        this.serviceRegistry = serviceRegistry;
        this.services = new Map();
        this.initialized = false;
    }
    /**
     * Initialize all advanced features
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.logger.info('AdvancedFeaturesRegistry: Initializing advanced features');
        try {
            // Create services
            this.logger.debug('AdvancedFeaturesRegistry: Creating services');
            // Create and register legal outcome predictor
            const outcomePredictor = new outcomePredictor_1.LegalOutcomePredictor();
            this.registerService('outcomePredictor', outcomePredictor);
            // Create and register adaptive document AI
            const adaptiveDocumentAI = (0, adaptiveIntelligence_1.createAdaptiveDocumentAI)(this.logger, this.eventBus, this.serviceRegistry);
            this.registerService('adaptiveDocumentAI', adaptiveDocumentAI);
            // Create and register intelligent workflow engine
            const workflowEngine = (0, intelligentWorkflow_1.createIntelligentWorkflowEngine)(this.logger, this.eventBus, this.serviceRegistry);
            this.registerService('workflowEngine', workflowEngine);
            // Create and register advanced risk assessment
            const riskAssessment = (0, advancedRiskAssessment_1.createAdvancedRiskAssessment)(this.logger, this.eventBus, this.serviceRegistry);
            this.registerService('riskAssessment', riskAssessment);
            // Create and register predictive compliance monitor
            const complianceMonitor = (0, predictiveMonitoring_1.createPredictiveComplianceMonitor)(this.logger, this.eventBus, this.serviceRegistry);
            this.registerService('complianceMonitor', complianceMonitor);
            // Create and register quantum-resistant security
            const quantumSecurity = (0, quantumResistant_1.createQuantumResistantSecurity)(this.logger, this.eventBus, this.serviceRegistry);
            this.registerService('quantumSecurity', quantumSecurity);
            // Initialize all services
            this.logger.debug('AdvancedFeaturesRegistry: Initializing services');
            await Promise.all(Array.from(this.services.entries()).map(async ([name, service]) => {
                try {
                    await service.initialize();
                    this.logger.debug(`AdvancedFeaturesRegistry: Initialized ${name}`);
                }
                catch (error) {
                    this.logger.error(`AdvancedFeaturesRegistry: Failed to initialize ${name}`, {
                        error
                    });
                    throw error;
                }
            }));
            // Register this registry with the global service registry
            this.serviceRegistry.register('advancedFeatures', this);
            this.initialized = true;
            this.logger.info('AdvancedFeaturesRegistry: All advanced features initialized successfully');
            // Emit initialization event
            this.eventBus.emit('advancedFeatures:initialized', {
                serviceCount: this.services.size
            });
        }
        catch (error) {
            this.logger.error('AdvancedFeaturesRegistry: Initialization failed', {
                error
            });
            throw error;
        }
    }
    /**
     * Dispose all advanced features
     */
    async dispose() {
        if (!this.initialized) {
            return;
        }
        this.logger.info('AdvancedFeaturesRegistry: Disposing advanced features');
        try {
            // Dispose all services
            await Promise.all(Array.from(this.services.entries()).map(async ([name, service]) => {
                try {
                    await service.dispose();
                    this.logger.debug(`AdvancedFeaturesRegistry: Disposed ${name}`);
                }
                catch (error) {
                    this.logger.error(`AdvancedFeaturesRegistry: Failed to dispose ${name}`, {
                        error
                    });
                    // Continue with other services even if one fails
                }
            }));
            // Clear services
            this.services.clear();
            // Unregister from global service registry
            this.serviceRegistry.unregister('advancedFeatures');
            this.initialized = false;
            this.logger.info('AdvancedFeaturesRegistry: All advanced features disposed successfully');
            // Emit disposal event
            this.eventBus.emit('advancedFeatures:disposed', {});
        }
        catch (error) {
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
    getService(name) {
        const service = this.services.get(name);
        return service || null;
    }
    /**
     * Register a service
     *
     * @param name Service name
     * @param service Service instance
     */
    registerService(name, service) {
        this.logger.debug(`AdvancedFeaturesRegistry: Registering service ${name}`);
        this.services.set(name, service);
    }
}
exports.AdvancedFeaturesRegistry = AdvancedFeaturesRegistry;
// Export factory function to create the registry
function createAdvancedFeaturesRegistry(logger, eventBus, serviceRegistry) {
    return new AdvancedFeaturesRegistry(logger, eventBus, serviceRegistry);
}
//# sourceMappingURL=registry.js.map