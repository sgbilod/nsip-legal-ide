/**
 * Compliance Engine
 * 
 * This module provides document compliance validation, regulatory tracking,
 * and compliance reporting for legal documents.
 */

import * as vscode from 'vscode';
import { 
    IService, 
    IEventEmitter,
    ILogger
} from '../core/interfaces';
import { 
    LegalDocument,
    Organization,
    ComplianceRiskArea,
    ComplianceRecommendation,
    ComplianceTimeline,
    ComplianceCostEstimate,
    CompliancePrediction
} from '../ml/interfaces';

// Compliance result interface
export interface ComplianceValidationResult {
    isCompliant: boolean;
    score: number; // 0.0 to 1.0
    issues: ComplianceIssue[];
    recommendations: ComplianceRecommendation[];
    riskAreas: ComplianceRiskArea[];
}

// Compliance issue interface
export interface ComplianceIssue {
    id: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    location?: {
        startLine: number;
        startCharacter: number;
        endLine: number;
        endCharacter: number;
    };
    regulatoryReference?: {
        framework: string;
        section: string;
        description: string;
        uri?: string;
    };
    suggestedFix?: string;
}

// Compliance validation options
export interface ComplianceValidationOptions {
    organization: Organization;
    jurisdictions: string[];
    frameworks?: string[];
    strictMode?: boolean;
    includeRecommendations?: boolean;
    includeRiskAssessment?: boolean;
}

// Compliance rule interface
export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    framework: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    validate(document: LegalDocument, options: ComplianceValidationOptions): ComplianceIssue[];
}

/**
 * Compliance Engine Service
 * 
 * Provides compliance validation and reporting for legal documents
 */
export class ComplianceEngine implements IService {
    private readonly rules: Map<string, ComplianceRule> = new Map();
    private readonly frameworkRegistry: Map<string, Set<string>> = new Map();
    private readonly eventBus: IEventEmitter;
    private readonly logger: ILogger;
    private initialized: boolean = false;
    
    /**
     * Creates a new instance of the ComplianceEngine
     * 
     * @param eventBus Event bus for publishing compliance events
     * @param logger Logger for compliance operations
     */
    constructor(eventBus: IEventEmitter, logger: ILogger) {
        this.eventBus = eventBus;
        this.logger = logger;
    }
    
    /**
     * Initialize the compliance engine
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }
        
        this.logger.info('Initializing ComplianceEngine');
        
        try {
            // Register built-in rules
            await this.registerBuiltInRules();
            
            // Subscribe to events
            this.eventBus.on('document.saved', this.onDocumentSaved.bind(this));
            this.eventBus.on('templates.rendered', this.onTemplateRendered.bind(this));
            this.eventBus.on('regulations.updated', this.onRegulationsUpdated.bind(this));
            
            this.initialized = true;
            this.logger.info('ComplianceEngine initialized successfully');
        } catch (error) {
            this.logger.info('Failed to initialize ComplianceEngine', error);
            throw error;
        }
    }
    
    /**
     * Dispose the compliance engine
     */
    public dispose(): void {
        this.logger.info('Disposing ComplianceEngine');
        
        // Unsubscribe from events
        this.eventBus.off('document.saved', this.onDocumentSaved.bind(this));
        this.eventBus.off('templates.rendered', this.onTemplateRendered.bind(this));
        this.eventBus.off('regulations.updated', this.onRegulationsUpdated.bind(this));
        
        // Clear rules
        this.rules.clear();
        this.frameworkRegistry.clear();
        
        this.initialized = false;
    }
    
    /**
     * Register a compliance rule
     * 
     * @param rule Compliance rule to register
     */
    public registerRule(rule: ComplianceRule): void {
        if (this.rules.has(rule.id)) {
            this.logger.warn(`Rule with ID ${rule.id} is already registered. Overwriting.`);
        }
        
        this.rules.set(rule.id, rule);
        
        // Register with framework registry
        if (!this.frameworkRegistry.has(rule.framework)) {
            this.frameworkRegistry.set(rule.framework, new Set<string>());
        }
        
        this.frameworkRegistry.get(rule.framework)?.add(rule.id);
        
        this.logger.debug(`Registered compliance rule: ${rule.id} (${rule.framework})`);
    }
    
    /**
     * Register a batch of compliance rules
     * 
     * @param rules Compliance rules to register
     */
    public registerRules(rules: ComplianceRule[]): void {
        for (const rule of rules) {
            this.registerRule(rule);
        }
    }
    
    /**
     * Unregister a compliance rule
     * 
     * @param ruleId ID of the rule to unregister
     * @returns true if the rule was unregistered, false if it wasn't found
     */
    public unregisterRule(ruleId: string): boolean {
        const rule = this.rules.get(ruleId);
        
        if (!rule) {
            return false;
        }
        
        this.rules.delete(ruleId);
        
        // Remove from framework registry
        const frameworkRules = this.frameworkRegistry.get(rule.framework);
        if (frameworkRules) {
            frameworkRules.delete(ruleId);
            
            if (frameworkRules.size === 0) {
                this.frameworkRegistry.delete(rule.framework);
            }
        }
        
        this.logger.debug(`Unregistered compliance rule: ${ruleId}`);
        return true;
    }
    
    /**
     * Get all registered compliance rules
     * 
     * @returns Array of all registered compliance rules
     */
    public getAllRules(): ComplianceRule[] {
        return Array.from(this.rules.values());
    }
    
    /**
     * Get rules for a specific regulatory framework
     * 
     * @param framework Regulatory framework name
     * @returns Array of compliance rules for the specified framework
     */
    public getRulesByFramework(framework: string): ComplianceRule[] {
        const ruleIds = this.frameworkRegistry.get(framework);
        
        if (!ruleIds) {
            return [];
        }
        
        return Array.from(ruleIds)
            .map(id => this.rules.get(id))
            .filter((rule): rule is ComplianceRule => rule !== undefined);
    }
    
    /**
     * Validate a document for compliance
     * 
     * @param document Document to validate
     * @param options Validation options
     * @returns Validation result
     */
    public validateDocument(document: LegalDocument, options: ComplianceValidationOptions): ComplianceValidationResult {
        this.logger.debug(`Validating document: ${document.id}`, { 
            type: document.type,
            frameworks: options.frameworks
        });
        
        if (!this.initialized) {
            throw new Error('ComplianceEngine is not initialized');
        }
        
        const allIssues: ComplianceIssue[] = [];
        const applicableRules: ComplianceRule[] = this.getApplicableRules(options);
        
        // Apply each applicable rule
        for (const rule of applicableRules) {
            try {
                const issues = rule.validate(document, options);
                allIssues.push(...issues);
            } catch (error) {
                this.logger.warn(`Error applying rule ${rule.id}`, error);
                
                // Add a system issue for the rule failure
                allIssues.push({
                    id: `rule-error-${rule.id}`,
                    severity: 'warning',
                    message: `Error applying compliance rule ${rule.name}: ${error instanceof Error ? error.message : String(error)}`,
                    regulatoryReference: {
                        framework: rule.framework,
                        section: 'N/A',
                        description: rule.description
                    }
                });
            }
        }
        
        // Calculate compliance score
        const score = this.calculateComplianceScore(allIssues);
        
        // Generate recommendations if requested
        const recommendations: ComplianceRecommendation[] = options.includeRecommendations 
            ? this.generateRecommendations(document, allIssues, options)
            : [];
        
        // Assess risk areas if requested
        const riskAreas: ComplianceRiskArea[] = options.includeRiskAssessment
            ? this.assessRiskAreas(document, allIssues, options)
            : [];
        
        // Determine overall compliance
        const isCompliant = this.isDocumentCompliant(allIssues, options.strictMode ?? false);
        
        // Emit validation event
        this.eventBus.emit('compliance.validated', {
            documentId: document.id,
            documentType: document.type,
            isCompliant,
            score,
            issueCount: allIssues.length,
            timestamp: new Date()
        });
        
        return {
            isCompliant,
            score,
            issues: allIssues,
            recommendations,
            riskAreas
        };
    }
    
    /**
     * Generate a compliance report for an organization
     * 
     * @param organization Organization to generate report for
     * @param documents Documents to include in the report
     * @returns Compliance prediction with recommendations and timeline
     */
    public async generateComplianceReport(organization: Organization, documents: LegalDocument[]): Promise<CompliancePrediction> {
        this.logger.info(`Generating compliance report for organization: ${organization.id}`);
        
        if (!this.initialized) {
            throw new Error('ComplianceEngine is not initialized');
        }
        
        // Validate each document
        const validationResults = documents.map(doc => {
            return this.validateDocument(doc, {
                organization,
                jurisdictions: organization.jurisdictions,
                frameworks: organization.regulatoryFrameworks,
                includeRecommendations: true,
                includeRiskAssessment: true
            });
        });
        
        // Calculate overall compliance score
        const currentCompliance = validationResults.reduce(
            (sum, result) => sum + result.score, 
            0
        ) / validationResults.length;
        
        // Collect all risk areas
        const allRiskAreas = validationResults.flatMap(result => result.riskAreas);
        
        // Prioritize risk areas
        const highRiskAreas = this.prioritizeRiskAreas(allRiskAreas);
        
        // Collect and deduplicate recommendations
        const recommendations = this.aggregateRecommendations(
            validationResults.flatMap(result => result.recommendations)
        );
        
        // Generate compliance timeline
        const timeline = this.generateComplianceTimeline(highRiskAreas, recommendations);
        
        // Generate cost estimate
        const costEstimate = this.generateCostEstimate(recommendations, organization);
        
        // Predict future compliance based on recommendations
        const predictedCompliance = this.predictFutureCompliance(currentCompliance, recommendations);
        
        return {
            currentCompliance,
            predictedCompliance,
            highRiskAreas,
            recommendations,
            timeline,
            costEstimate
        };
    }
    
    /**
     * Get diagnostic information for a document based on compliance validation
     * 
     * @param document Document to validate
     * @param options Validation options
     * @returns VS Code diagnostics for the document
     */
    public getDiagnostics(document: LegalDocument, options: ComplianceValidationOptions): vscode.Diagnostic[] {
        const validationResult = this.validateDocument(document, options);
        
        return validationResult.issues
            .filter(issue => issue.location !== undefined)
            .map(issue => {
                const range = new vscode.Range(
                    issue.location!.startLine,
                    issue.location!.startCharacter,
                    issue.location!.endLine,
                    issue.location!.endCharacter
                );
                
                const diagnostic = new vscode.Diagnostic(
                    range,
                    issue.message,
                    this.mapSeverityToDiagnosticSeverity(issue.severity)
                );
                
                diagnostic.source = 'ComplianceEngine';
                diagnostic.code = issue.id;
                
                if (issue.regulatoryReference) {
                    diagnostic.tags = [vscode.DiagnosticTag.Unnecessary];
                    diagnostic.relatedInformation = [
                        new vscode.DiagnosticRelatedInformation(
                            new vscode.Location(
                                vscode.Uri.parse(issue.regulatoryReference.uri || ''),
                                new vscode.Position(0, 0)
                            ),
                            `${issue.regulatoryReference.framework}: ${issue.regulatoryReference.description}`
                        )
                    ];
                }
                
                return diagnostic;
            });
    }
    
    /**
     * Get document quick fixes for compliance issues
     * 
     * @param document Document with issues
     * @param issue Compliance issue
     * @returns Quick fix actions or undefined if no fix is available
     */
    public getQuickFixes(document: LegalDocument, issue: ComplianceIssue): vscode.CodeAction[] | undefined {
        if (!issue.suggestedFix || !issue.location) {
            return undefined;
        }
        
        const fixes: vscode.CodeAction[] = [];
        
        // Create fix action
        const fix = new vscode.CodeAction(
            `Fix: ${issue.suggestedFix.length > 30 ? issue.suggestedFix.substring(0, 30) + '...' : issue.suggestedFix}`,
            vscode.CodeActionKind.QuickFix
        );
        
        // Create text edit
        const range = new vscode.Range(
            issue.location.startLine,
            issue.location.startCharacter,
            issue.location.endLine,
            issue.location.endCharacter
        );
        
        fix.edit = new vscode.WorkspaceEdit();
        fix.edit.replace(
            vscode.Uri.parse(document.id),
            range,
            issue.suggestedFix
        );
        
        fixes.push(fix);
        
        // Create "See regulatory reference" action if available
        if (issue.regulatoryReference && issue.regulatoryReference.uri) {
            const seeReference = new vscode.CodeAction(
                `Open ${issue.regulatoryReference.framework} reference`,
                vscode.CodeActionKind.QuickFix
            );
            
            seeReference.command = {
                command: 'vscode.open',
                title: 'Open Reference',
                arguments: [vscode.Uri.parse(issue.regulatoryReference.uri)]
            };
            
            fixes.push(seeReference);
        }
        
        return fixes;
    }
    
    // Private methods
    
    private async registerBuiltInRules(): Promise<void> {
        // Register built-in rules
        // In a real implementation, these would be loaded from a rule database
        // or from regulatory compliance packages
        
        // Example built-in rule
        this.registerRule({
            id: 'gdpr-001',
            name: 'GDPR Data Processing Disclosure',
            description: 'Verifies that GDPR-compliant data processing disclosures are included',
            framework: 'GDPR',
            severity: 'error',
            validate: (document: LegalDocument, options: ComplianceValidationOptions): ComplianceIssue[] => {
                const issues: ComplianceIssue[] = [];
                
                // Simple example implementation - look for GDPR-related terms
                if (document.type === 'agreement' && 
                    options.jurisdictions.some(j => j.includes('EU')) &&
                    !document.content.toLowerCase().includes('data processing') &&
                    !document.content.toLowerCase().includes('gdpr')) {
                    
                    issues.push({
                        id: 'gdpr-001-1',
                        severity: 'error',
                        message: 'Missing GDPR data processing disclosure',
                        regulatoryReference: {
                            framework: 'GDPR',
                            section: 'Article 13',
                            description: 'Information to be provided where personal data are collected'
                        },
                        suggestedFix: 'Add GDPR data processing disclosure section'
                    });
                }
                
                return issues;
            }
        });
        
        // In a real implementation, more rules would be registered here
    }
    
    private onDocumentSaved(data: any): void {
        // Auto-validate document on save if configured
        const config = vscode.workspace.getConfiguration('nsip.compliance');
        
        if (config.get<boolean>('validateOnSave', true)) {
            // Validation would happen here
            this.logger.debug('Document saved, triggering validation', data);
        }
    }
    
    private onTemplateRendered(data: any): void {
        // Validate newly rendered templates if configured
        const config = vscode.workspace.getConfiguration('nsip.compliance');
        
        if (config.get<boolean>('validateRenderedTemplates', true)) {
            // Validation would happen here
            this.logger.debug('Template rendered, triggering validation', data);
        }
    }
    
    private onRegulationsUpdated(data: any): void {
        // Update rules based on regulation changes
        this.logger.info('Regulations updated, updating compliance rules', data);
        
        // In a real implementation, this would refresh rules from a regulatory database
    }
    
    private getApplicableRules(options: ComplianceValidationOptions): ComplianceRule[] {
        if (!options.frameworks || options.frameworks.length === 0) {
            // If no specific frameworks are requested, use all registered rules
            return this.getAllRules();
        }
        
        // Get rules for each requested framework
        return options.frameworks.flatMap(framework => this.getRulesByFramework(framework));
    }
    
    private calculateComplianceScore(issues: ComplianceIssue[]): number {
        if (issues.length === 0) {
            return 1.0; // Perfect score if no issues
        }
        
        // Calculate weighted score based on issue severity
        const weights = {
            'info': 0.1,
            'warning': 0.3,
            'error': 0.6,
            'critical': 1.0
        };
        
        const totalWeight = issues.reduce((sum, issue) => sum + weights[issue.severity], 0);
        const maxPossibleWeight = issues.length; // If all issues were critical
        
        // Higher score is better (1.0 = perfect compliance)
        return Math.max(0, 1.0 - (totalWeight / maxPossibleWeight));
    }
    
    private isDocumentCompliant(issues: ComplianceIssue[], strictMode: boolean): boolean {
        if (strictMode) {
            // In strict mode, any issues make the document non-compliant
            return issues.length === 0;
        }
        
        // In normal mode, only error and critical issues make the document non-compliant
        return !issues.some(issue => 
            issue.severity === 'error' || issue.severity === 'critical'
        );
    }
    
    private generateRecommendations(
        _document: LegalDocument, 
        issues: ComplianceIssue[],
        _options: ComplianceValidationOptions
    ): ComplianceRecommendation[] {
        // Group issues by regulatory framework
        const issuesByFramework: Map<string, ComplianceIssue[]> = new Map();
        
        for (const issue of issues) {
            if (!issue.regulatoryReference) {
                continue;
            }
            
            const framework = issue.regulatoryReference.framework;
            
            if (!issuesByFramework.has(framework)) {
                issuesByFramework.set(framework, []);
            }
            
            issuesByFramework.get(framework)!.push(issue);
        }
        
        // Generate recommendations for each framework
        const recommendations: ComplianceRecommendation[] = [];
        
        issuesByFramework.forEach((frameworkIssues, framework) => {
            // Group by severity
            const criticalIssues = frameworkIssues.filter(i => i.severity === 'critical');
            const errorIssues = frameworkIssues.filter(i => i.severity === 'error');
            const warningIssues = frameworkIssues.filter(i => i.severity === 'warning');
            
            // Generate recommendation for critical issues
            if (criticalIssues.length > 0) {
                const deadline = new Date();
                deadline.setDate(deadline.getDate() + 7); // 1 week for critical issues
                
                recommendations.push({
                    title: `Fix Critical ${framework} Compliance Issues`,
                    description: `Address ${criticalIssues.length} critical compliance issues related to ${framework}`,
                    priority: 'critical',
                    effort: criticalIssues.length > 5 ? 'high' : 'medium',
                    steps: criticalIssues.map(i => i.message),
                    impact: 0.9, // High impact
                    deadline
                });
            }
            
            // Generate recommendation for error issues
            if (errorIssues.length > 0) {
                const deadline = new Date();
                deadline.setDate(deadline.getDate() + 14); // 2 weeks for error issues
                
                recommendations.push({
                    title: `Resolve ${framework} Compliance Errors`,
                    description: `Address ${errorIssues.length} compliance errors related to ${framework}`,
                    priority: 'high',
                    effort: errorIssues.length > 10 ? 'high' : 'medium',
                    steps: errorIssues.map(i => i.message),
                    impact: 0.7, // Significant impact
                    deadline
                });
            }
            
            // Generate recommendation for warning issues
            if (warningIssues.length > 0) {
                const deadline = new Date();
                deadline.setDate(deadline.getDate() + 30); // 1 month for warning issues
                
                recommendations.push({
                    title: `Improve ${framework} Compliance`,
                    description: `Address ${warningIssues.length} compliance warnings related to ${framework}`,
                    priority: 'medium',
                    effort: 'low',
                    steps: warningIssues.map(i => i.message),
                    impact: 0.4, // Moderate impact
                    deadline
                });
            }
        });
        
        return recommendations;
    }
    
    private assessRiskAreas(
        _document: LegalDocument,
        issues: ComplianceIssue[],
        _options: ComplianceValidationOptions
    ): ComplianceRiskArea[] {
        // Group issues by regulatory framework
        const issuesByFramework: Map<string, ComplianceIssue[]> = new Map();
        
        for (const issue of issues) {
            if (!issue.regulatoryReference) {
                continue;
            }
            
            const framework = issue.regulatoryReference.framework;
            
            if (!issuesByFramework.has(framework)) {
                issuesByFramework.set(framework, []);
            }
            
            issuesByFramework.get(framework)!.push(issue);
        }
        
        // Generate risk areas for each framework
        const riskAreas: ComplianceRiskArea[] = [];
        
        issuesByFramework.forEach((frameworkIssues, framework) => {
            // Calculate risk score based on issue severity
            const weights = {
                'info': 0.1,
                'warning': 0.3,
                'error': 0.6,
                'critical': 0.9
            };
            
            const totalWeight = frameworkIssues.reduce((sum, issue) => sum + weights[issue.severity], 0);
            const maxPossibleWeight = frameworkIssues.length; // If all issues were critical
            
            // Higher score means higher risk
            const riskScore = Math.min(0.95, totalWeight / maxPossibleWeight);
            
            // Determine complexity
            let complexity: 'low' | 'medium' | 'high';
            
            if (frameworkIssues.length > 10 || frameworkIssues.some(i => i.severity === 'critical')) {
                complexity = 'high';
            } else if (frameworkIssues.length > 5 || frameworkIssues.some(i => i.severity === 'error')) {
                complexity = 'medium';
            } else {
                complexity = 'low';
            }
            
            // Set deadline based on severity
            const deadline = new Date();
            
            if (frameworkIssues.some(i => i.severity === 'critical')) {
                deadline.setDate(deadline.getDate() + 7); // 1 week for critical issues
            } else if (frameworkIssues.some(i => i.severity === 'error')) {
                deadline.setDate(deadline.getDate() + 14); // 2 weeks for error issues
            } else {
                deadline.setDate(deadline.getDate() + 30); // 1 month for warning issues
            }
            
            // Generate impact description
            const criticalCount = frameworkIssues.filter(i => i.severity === 'critical').length;
            const errorCount = frameworkIssues.filter(i => i.severity === 'error').length;
            const warningCount = frameworkIssues.filter(i => i.severity === 'warning').length;
            const infoCount = frameworkIssues.filter(i => i.severity === 'info').length;
            
            let impactDescription = `Compliance risk with ${framework}: `;
            
            if (criticalCount > 0) {
                impactDescription += `${criticalCount} critical issues, `;
            }
            
            if (errorCount > 0) {
                impactDescription += `${errorCount} errors, `;
            }
            
            if (warningCount > 0) {
                impactDescription += `${warningCount} warnings, `;
            }
            
            if (infoCount > 0) {
                impactDescription += `${infoCount} information items, `;
            }
            
            // Remove trailing comma and space
            impactDescription = impactDescription.slice(0, -2);
            
            // Add risk area
            riskAreas.push({
                area: `${framework} Compliance`,
                framework,
                riskScore,
                impactDescription,
                deadline,
                complexity
            });
        });
        
        return riskAreas;
    }
    
    private prioritizeRiskAreas(riskAreas: ComplianceRiskArea[]): ComplianceRiskArea[] {
        // Sort by risk score (highest first)
        return [...riskAreas].sort((a, b) => b.riskScore - a.riskScore);
    }
    
    private aggregateRecommendations(recommendations: ComplianceRecommendation[]): ComplianceRecommendation[] {
        // Group by title
        const groupedRecommendations: Map<string, ComplianceRecommendation[]> = new Map();
        
        for (const recommendation of recommendations) {
            if (!groupedRecommendations.has(recommendation.title)) {
                groupedRecommendations.set(recommendation.title, []);
            }
            
            groupedRecommendations.get(recommendation.title)!.push(recommendation);
        }
        
        // Merge grouped recommendations
        const mergedRecommendations: ComplianceRecommendation[] = [];
        
        groupedRecommendations.forEach((group, title) => {
            if (group.length === 1 && group[0]) {
                // If only one recommendation, just add it
                mergedRecommendations.push(group[0]);
                return;
            }
            
            // Merge similar recommendations
            const mergedRecommendation: ComplianceRecommendation = {
                title,
                description: group[0]?.description || `Merged recommendations for ${title}`,
                priority: this.getHighestPriority(group.map(r => r.priority)),
                effort: this.getHighestEffort(group.map(r => r.effort)),
                steps: Array.from(new Set(group.flatMap(r => r.steps))),
                impact: Math.max(...group.map(r => r.impact)),
                deadline: new Date(Math.min(...group.map(r => r.deadline.getTime())))
            };
            
            mergedRecommendations.push(mergedRecommendation);
        });
        
        // Sort by priority and deadline
        return mergedRecommendations.sort((a, b) => {
            const priorityOrder = {
                'critical': 0,
                'high': 1,
                'medium': 2,
                'low': 3
            };
            
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            
            if (priorityDiff !== 0) {
                return priorityDiff;
            }
            
            return a.deadline.getTime() - b.deadline.getTime();
        });
    }
    
    private getHighestPriority(priorities: ('low' | 'medium' | 'high' | 'critical')[]): 'low' | 'medium' | 'high' | 'critical' {
        if (priorities.includes('critical')) return 'critical';
        if (priorities.includes('high')) return 'high';
        if (priorities.includes('medium')) return 'medium';
        return 'low';
    }
    
    private getHighestEffort(efforts: ('low' | 'medium' | 'high')[]): 'low' | 'medium' | 'high' {
        if (efforts.includes('high')) return 'high';
        if (efforts.includes('medium')) return 'medium';
        return 'low';
    }
    
    private generateComplianceTimeline(
        riskAreas: ComplianceRiskArea[],
        recommendations: ComplianceRecommendation[]
    ): ComplianceTimeline {
        const events: {
            date: Date;
            description: string;
            importance: 'low' | 'medium' | 'high';
            type: 'regulatory' | 'internal' | 'deadline' | 'review';
        }[] = [];
        
        // Add events for risk area deadlines
        for (const riskArea of riskAreas) {
            events.push({
                date: riskArea.deadline,
                description: `${riskArea.framework} compliance deadline`,
                importance: riskArea.riskScore > 0.7 ? 'high' : (riskArea.riskScore > 0.4 ? 'medium' : 'low'),
                type: 'deadline'
            });
        }
        
        // Add events for recommendation deadlines
        for (const recommendation of recommendations) {
            events.push({
                date: recommendation.deadline,
                description: recommendation.title,
                importance: recommendation.priority === 'critical' ? 'high' : 
                            (recommendation.priority === 'high' ? 'medium' : 'low'),
                type: 'internal'
            });
        }
        
        // Add review events halfway to deadlines
        const now = new Date();
        
        for (const riskArea of riskAreas) {
            if (riskArea.riskScore > 0.5) {
                const reviewDate = new Date();
                const daysToDeadline = Math.floor((riskArea.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                reviewDate.setDate(now.getDate() + Math.floor(daysToDeadline / 2));
                
                events.push({
                    date: reviewDate,
                    description: `Review ${riskArea.framework} compliance progress`,
                    importance: 'medium',
                    type: 'review'
                });
            }
        }
        
        // Sort events by date
        events.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Create critical path (dates of high importance events)
        const criticalPath = events
            .filter(e => e.importance === 'high')
            .map(e => e.date);
        
        return {
            events,
            criticalPath
        };
    }
    
    private generateCostEstimate(
        recommendations: ComplianceRecommendation[],
        organization: Organization
    ): ComplianceCostEstimate {
        // In a real implementation, this would use more sophisticated cost modeling
        // This is a simplified example
        
        const baseCostPerHour = 150; // Base hourly rate for compliance work
        
        // Effort to hours mapping
        const effortToHours = {
            'low': 4,
            'medium': 16,
            'high': 40
        };
        
        // Organization size multiplier
        const sizeMultiplier = organization.size > 1000 ? 2.0 : 
                               organization.size > 100 ? 1.5 :
                               organization.size > 10 ? 1.0 : 0.5;
        
        // Calculate costs for each recommendation
        const breakdown: {
            category: string;
            amount: number;
            description: string;
        }[] = [];
        
        let totalCost = 0;
        
        for (const recommendation of recommendations) {
            const hours = effortToHours[recommendation.effort];
            const cost = hours * baseCostPerHour * sizeMultiplier;
            
            breakdown.push({
                category: recommendation.title,
                amount: cost,
                description: `${recommendation.effort} effort (${hours} hours) at $${baseCostPerHour}/hr with ${sizeMultiplier}x org size multiplier`
            });
            
            totalCost += cost;
        }
        
        // Calculate scenario costs
        const bestCase = totalCost * 0.7;
        const worstCase = totalCost * 1.5;
        
        // Calculate ROI (assuming non-compliance costs are 3x compliance costs)
        const nonComplianceCost = totalCost * 3;
        const roi = (nonComplianceCost - totalCost) / totalCost;
        
        return {
            total: totalCost,
            breakdown,
            scenarios: {
                best: bestCase,
                expected: totalCost,
                worst: worstCase
            },
            roi
        };
    }
    
    private predictFutureCompliance(
        currentCompliance: number,
        recommendations: ComplianceRecommendation[]
    ): number {
        // Calculate potential improvement from implementing recommendations
        const totalImpact = recommendations.reduce((sum, rec) => sum + rec.impact, 0);
        
        // Cap the maximum impact to avoid unrealistic predictions
        const cappedImpact = Math.min(1.0, totalImpact);
        
        // Calculate potential improvement (gap between current and perfect compliance)
        const complianceGap = 1.0 - currentCompliance;
        
        // Predicted improvement is a portion of the gap based on recommendation impact
        const predictedImprovement = complianceGap * cappedImpact;
        
        // New compliance score
        return Math.min(0.99, currentCompliance + predictedImprovement);
    }
    
    private mapSeverityToDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'critical':
                return vscode.DiagnosticSeverity.Error;
            case 'error':
                return vscode.DiagnosticSeverity.Error;
            case 'warning':
                return vscode.DiagnosticSeverity.Warning;
            case 'info':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Information;
        }
    }
}
