"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceEngine = void 0;
const serviceRegistry_1 = require("../core/serviceRegistry");
/**
 * Compliance Engine Service - Handles legal compliance validation and rules
 */
class ComplianceEngine {
    constructor() {
        this.rules = new Map();
        this.jurisdictions = new Map();
    }
    /**
     * Initialize the compliance engine
     */
    async initialize() {
        this.logger = serviceRegistry_1.ServiceRegistry.getInstance().get('logger');
        this.eventBus = serviceRegistry_1.ServiceRegistry.getInstance().get('eventBus');
        // Register for events
        this.eventBus.subscribe('document.validate', this.validateDocument.bind(this));
        // Load rules and jurisdictions
        await this.loadRules();
        await this.loadJurisdictions();
        this.logger.info('Compliance engine initialized');
    }
    /**
     * Load compliance rules from extension resources
     */
    async loadRules() {
        try {
            // In a real implementation, these would be loaded from JSON files
            // or external APIs. For this example, we'll use some sample rules.
            const sampleRules = [
                {
                    id: 'gdpr-data-processing',
                    name: 'GDPR Data Processing Clause',
                    description: 'Validates that GDPR-compliant data processing language is present',
                    jurisdictions: ['EU', 'EEA'],
                    docTypes: ['privacy-policy', 'data-processing-agreement'],
                    severity: 'error',
                    pattern: /data processing|personal data|data controller|data processor/i,
                    validationFn: (text) => {
                        const result = text.match(/data processing|personal data|data controller|data processor/i);
                        return {
                            valid: !!result,
                            details: result
                                ? 'Found GDPR data processing language'
                                : 'Missing GDPR data processing language'
                        };
                    }
                },
                {
                    id: 'ccpa-notice',
                    name: 'CCPA Privacy Notice',
                    description: 'Validates that CCPA-compliant privacy notice language is present',
                    jurisdictions: ['US-CA'],
                    docTypes: ['privacy-policy', 'terms-of-service'],
                    severity: 'error',
                    pattern: /right to know|right to delete|right to opt-out|right to non-discrimination/i,
                    validationFn: (text) => {
                        const result = text.match(/right to know|right to delete|right to opt-out|right to non-discrimination/i);
                        return {
                            valid: !!result,
                            details: result
                                ? 'Found CCPA privacy notice language'
                                : 'Missing CCPA privacy notice language'
                        };
                    }
                },
                {
                    id: 'contract-governing-law',
                    name: 'Contract Governing Law',
                    description: 'Validates that a governing law clause is present',
                    jurisdictions: ['*'],
                    docTypes: ['contract', 'agreement', 'terms-of-service'],
                    severity: 'warning',
                    pattern: /governing law|governed by|jurisdiction|applicable law/i,
                    validationFn: (text) => {
                        const result = text.match(/governing law|governed by|jurisdiction|applicable law/i);
                        return {
                            valid: !!result,
                            details: result
                                ? 'Found governing law clause'
                                : 'Missing governing law clause'
                        };
                    }
                }
            ];
            for (const rule of sampleRules) {
                this.rules.set(rule.id, rule);
            }
            this.logger.info(`Loaded ${this.rules.size} compliance rules`);
        }
        catch (error) {
            this.logger.error('Failed to load compliance rules', error);
        }
    }
    /**
     * Load jurisdiction information from extension resources
     */
    async loadJurisdictions() {
        try {
            // In a real implementation, these would be loaded from JSON files
            // or external APIs. For this example, we'll use some sample jurisdictions.
            const sampleJurisdictions = [
                {
                    id: 'US',
                    name: 'United States',
                    description: 'Federal laws and regulations of the United States',
                    parent: null,
                    regulations: [
                        { id: 'federal-contracts', name: 'Federal Contracts' },
                        { id: 'sec-regulations', name: 'SEC Regulations' }
                    ]
                },
                {
                    id: 'US-CA',
                    name: 'California',
                    description: 'Laws and regulations of the state of California',
                    parent: 'US',
                    regulations: [
                        { id: 'ccpa', name: 'California Consumer Privacy Act (CCPA)' },
                        { id: 'cpra', name: 'California Privacy Rights Act (CPRA)' }
                    ]
                },
                {
                    id: 'EU',
                    name: 'European Union',
                    description: 'Laws and regulations of the European Union',
                    parent: null,
                    regulations: [
                        { id: 'gdpr', name: 'General Data Protection Regulation (GDPR)' },
                        { id: 'ecommerce-directive', name: 'E-Commerce Directive' }
                    ]
                }
            ];
            for (const jurisdiction of sampleJurisdictions) {
                this.jurisdictions.set(jurisdiction.id, jurisdiction);
            }
            this.logger.info(`Loaded ${this.jurisdictions.size} jurisdictions`);
        }
        catch (error) {
            this.logger.error('Failed to load jurisdictions', error);
        }
    }
    /**
     * Validate a document for compliance
     * @param params Validation parameters
     * @returns Validation results
     */
    async validateDocument(params) {
        const { text, documentType, jurisdictions = ['*'] } = params;
        this.logger.info(`Validating document of type ${documentType} for jurisdictions: ${jurisdictions.join(', ')}`);
        try {
            const applicableRules = this.getApplicableRules(documentType, jurisdictions);
            const results = [];
            for (const rule of applicableRules) {
                this.logger.debug(`Applying rule: ${rule.id}`);
                // Run validation function
                const validationResult = rule.validationFn(text);
                // Add to results
                results.push({
                    ruleId: rule.id,
                    ruleName: rule.name,
                    valid: validationResult.valid,
                    severity: rule.severity,
                    details: validationResult.details,
                    location: validationResult.location
                });
            }
            // Calculate overall validity
            const isValid = results.every(r => r.valid || r.severity === 'info');
            // Return result
            const validationResult = {
                isValid,
                documentType,
                jurisdictions,
                results,
                timestamp: new Date().toISOString()
            };
            // Publish validation result
            this.eventBus.publish('document.validated', validationResult);
            return validationResult;
        }
        catch (error) {
            this.logger.error('Document validation failed', error);
            throw new Error(`Validation failed: ${error.message}`);
        }
    }
    /**
     * Get rules applicable to a document type and jurisdictions
     * @param documentType Document type
     * @param jurisdictions Jurisdictions to consider
     * @returns Applicable rules
     */
    getApplicableRules(documentType, jurisdictions) {
        return Array.from(this.rules.values()).filter(rule => {
            // Check document type
            const matchesDocType = rule.docTypes.includes(documentType) ||
                rule.docTypes.includes('*');
            // Check jurisdictions (include global rules marked with '*')
            const matchesJurisdiction = rule.jurisdictions.includes('*') ||
                jurisdictions.includes('*') ||
                rule.jurisdictions.some(j => jurisdictions.includes(j));
            return matchesDocType && matchesJurisdiction;
        });
    }
    /**
     * Get all compliance rules
     * @returns Array of compliance rules
     */
    getAllRules() {
        return Array.from(this.rules.values());
    }
    /**
     * Get a rule by ID
     * @param id Rule ID
     * @returns Compliance rule
     */
    getRule(id) {
        return this.rules.get(id);
    }
    /**
     * Get rules for a specific jurisdiction
     * @param jurisdictionId Jurisdiction ID
     * @returns Array of compliance rules
     */
    getRulesForJurisdiction(jurisdictionId) {
        return Array.from(this.rules.values()).filter(rule => rule.jurisdictions.includes(jurisdictionId) ||
            rule.jurisdictions.includes('*'));
    }
    /**
     * Get all jurisdictions
     * @returns Array of jurisdictions
     */
    getAllJurisdictions() {
        return Array.from(this.jurisdictions.values());
    }
    /**
     * Get jurisdiction by ID
     * @param id Jurisdiction ID
     * @returns Jurisdiction information
     */
    getJurisdiction(id) {
        return this.jurisdictions.get(id);
    }
    /**
     * Add a custom compliance rule
     * @param rule Compliance rule
     * @returns Added rule
     */
    addRule(rule) {
        this.rules.set(rule.id, rule);
        this.logger.info(`Added compliance rule: ${rule.id}`);
        return rule;
    }
    /**
     * Update a compliance rule
     * @param id Rule ID
     * @param updates Rule updates
     * @returns Updated rule
     */
    updateRule(id, updates) {
        const rule = this.rules.get(id);
        if (!rule) {
            throw new Error(`Rule not found: ${id}`);
        }
        const updatedRule = { ...rule, ...updates };
        this.rules.set(id, updatedRule);
        this.logger.info(`Updated compliance rule: ${id}`);
        return updatedRule;
    }
    /**
     * Delete a compliance rule
     * @param id Rule ID
     * @returns True if rule was deleted
     */
    deleteRule(id) {
        const deleted = this.rules.delete(id);
        if (deleted) {
            this.logger.info(`Deleted compliance rule: ${id}`);
        }
        return deleted;
    }
    /**
     * Dispose the compliance engine
     */
    dispose() {
        // Unsubscribe from events
        this.eventBus.unsubscribeAll(this.validateDocument);
    }
}
exports.ComplianceEngine = ComplianceEngine;
//# sourceMappingURL=complianceEngine.js.map