import { IService } from '../core/serviceRegistry';
/**
 * Compliance Engine Service - Handles legal compliance validation and rules
 */
export declare class ComplianceEngine implements IService {
    private logger;
    private eventBus;
    private rules;
    private jurisdictions;
    /**
     * Initialize the compliance engine
     */
    initialize(): Promise<void>;
    /**
     * Load compliance rules from extension resources
     */
    private loadRules;
    /**
     * Load jurisdiction information from extension resources
     */
    private loadJurisdictions;
    /**
     * Validate a document for compliance
     * @param params Validation parameters
     * @returns Validation results
     */
    validateDocument(params: ValidateDocumentParams): Promise<ValidationResult>;
    /**
     * Get rules applicable to a document type and jurisdictions
     * @param documentType Document type
     * @param jurisdictions Jurisdictions to consider
     * @returns Applicable rules
     */
    private getApplicableRules;
    /**
     * Get all compliance rules
     * @returns Array of compliance rules
     */
    getAllRules(): ComplianceRule[];
    /**
     * Get a rule by ID
     * @param id Rule ID
     * @returns Compliance rule
     */
    getRule(id: string): ComplianceRule | undefined;
    /**
     * Get rules for a specific jurisdiction
     * @param jurisdictionId Jurisdiction ID
     * @returns Array of compliance rules
     */
    getRulesForJurisdiction(jurisdictionId: string): ComplianceRule[];
    /**
     * Get all jurisdictions
     * @returns Array of jurisdictions
     */
    getAllJurisdictions(): JurisdictionInfo[];
    /**
     * Get jurisdiction by ID
     * @param id Jurisdiction ID
     * @returns Jurisdiction information
     */
    getJurisdiction(id: string): JurisdictionInfo | undefined;
    /**
     * Add a custom compliance rule
     * @param rule Compliance rule
     * @returns Added rule
     */
    addRule(rule: ComplianceRule): ComplianceRule;
    /**
     * Update a compliance rule
     * @param id Rule ID
     * @param updates Rule updates
     * @returns Updated rule
     */
    updateRule(id: string, updates: Partial<ComplianceRule>): ComplianceRule;
    /**
     * Delete a compliance rule
     * @param id Rule ID
     * @returns True if rule was deleted
     */
    deleteRule(id: string): boolean;
    /**
     * Dispose the compliance engine
     */
    dispose(): void;
}
/**
 * Compliance rule interface
 */
export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    jurisdictions: string[];
    docTypes: string[];
    severity: 'info' | 'warning' | 'error';
    pattern: RegExp;
    validationFn: (text: string) => {
        valid: boolean;
        details: string;
        location?: {
            start: number;
            end: number;
        };
    };
}
/**
 * Jurisdiction information interface
 */
export interface JurisdictionInfo {
    id: string;
    name: string;
    description: string;
    parent: string | null;
    regulations: {
        id: string;
        name: string;
    }[];
}
/**
 * Validate document parameters interface
 */
export interface ValidateDocumentParams {
    text: string;
    documentType: string;
    jurisdictions?: string[];
}
/**
 * Validation rule result interface
 */
export interface ValidationRuleResult {
    ruleId: string;
    ruleName: string;
    valid: boolean;
    severity: 'info' | 'warning' | 'error';
    details: string;
    location?: {
        start: number;
        end: number;
    };
}
/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    documentType: string;
    jurisdictions: string[];
    results: ValidationRuleResult[];
    timestamp: string;
}
