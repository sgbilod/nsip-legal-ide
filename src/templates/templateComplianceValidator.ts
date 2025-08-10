/**
 * Template Compliance Integration
 * 
 * This module integrates the template engine with the compliance engine
 * to provide compliance validation during document generation.
 */

import * as vscode from 'vscode';
import { IService } from '../core/interfaces';
import { TemplateEngine } from '../templates/templateEngine';
import { ComplianceEngine } from '../compliance/complianceEngine';
import { LegalDocument, Organization } from '../ml/interfaces';
import { Logger } from '../core/logger';

/**
 * Template Compliance Validator Service
 * 
 * Validates generated documents for compliance issues during template rendering
 */
export class TemplateComplianceValidator implements IService {
    private readonly templateEngine: TemplateEngine;
    private readonly complianceEngine: ComplianceEngine;
    private readonly logger: Logger;
    private initialized: boolean = false;
    
    /**
     * Creates a new instance of the TemplateComplianceValidator
     * 
     * @param templateEngine The template engine to integrate with
     * @param complianceEngine The compliance engine to use for validation
     * @param logger Logger for operations
     */
    constructor(
        templateEngine: TemplateEngine,
        complianceEngine: ComplianceEngine,
        logger: Logger
    ) {
        this.templateEngine = templateEngine;
        this.complianceEngine = complianceEngine;
        this.logger = logger;
    }
    
    /**
     * Initialize the template compliance validator
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }
        
        this.logger.info('Initializing TemplateComplianceValidator');
        
        try {
            // Register event listeners for template rendering events
            const originalRenderTemplate = this.templateEngine.renderTemplate.bind(this.templateEngine);
            
            // Override the renderTemplate method to add compliance validation
            this.templateEngine.renderTemplate = (templateId: string, context: any): string => {
                // Call the original method to get the rendered content
                const renderedContent = originalRenderTemplate(templateId, context);
                
                // Trigger async validation (don't block rendering)
                this.validateRenderedContent(templateId, renderedContent, context);
                
                // Return the rendered content
                return renderedContent;
            };
            
            this.initialized = true;
            this.logger.info('TemplateComplianceValidator initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize TemplateComplianceValidator', error);
            throw error;
        }
    }
    
    /**
     * Dispose the template compliance validator
     */
    public dispose(): void {
        this.logger.info('Disposing TemplateComplianceValidator');
        
        // Restore original renderTemplate method if possible
        // Note: This isn't perfect as we don't have a clean way to unwrap
        
        this.initialized = false;
    }
    
    /**
     * Validate rendered content from a template
     * 
     * @param templateId ID of the template that was rendered
     * @param renderedContent The rendered content to validate
     * @param context The context used for rendering
     */
    private async validateRenderedContent(
        templateId: string,
        renderedContent: string,
        context: any
    ): Promise<void> {
        try {
            this.logger.debug(`Validating compliance for rendered template: ${templateId}`);
            
            // Create a temporary document from the rendered content
            const legalDocument: LegalDocument = {
                id: `template:${templateId}`,
                title: context.title || templateId,
                content: renderedContent,
                type: this.getDocumentTypeFromContext(context) || 'agreement',
                metadata: {
                    templateId,
                    generatedAt: new Date().toISOString(),
                    context: JSON.stringify(context)
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0',
                authors: context.authors || ['System'],
                status: 'draft'
            };
            
            // Create organization from context if available
            const organization: Organization = this.createOrganizationFromContext(context);
            
            // Create validation options
            const validationOptions = {
                organization,
                jurisdictions: organization.jurisdictions,
                frameworks: organization.regulatoryFrameworks,
                strictMode: false,
                includeRecommendations: true,
                includeRiskAssessment: true
            };
            
            // Validate the document
            const validationResult = this.complianceEngine.validateDocument(legalDocument, validationOptions);
            
            // If there are issues, show a notification
            if (validationResult.issues.length > 0) {
                const criticalCount = validationResult.issues.filter(i => i.severity === 'critical').length;
                const errorCount = validationResult.issues.filter(i => i.severity === 'error').length;
                const warningCount = validationResult.issues.filter(i => i.severity === 'warning').length;
                const infoCount = validationResult.issues.filter(i => i.severity === 'info').length;
                
                const message = `Compliance issues in generated document: ${criticalCount} critical, ${errorCount} errors, ${warningCount} warnings, ${infoCount} info`;
                
                // For critical/error issues, show warning notification
                if (criticalCount > 0 || errorCount > 0) {
                    vscode.window.showWarningMessage(message, 'View Issues').then(selection => {
                        if (selection === 'View Issues') {
                            this.showComplianceReport(templateId, validationResult);
                        }
                    });
                } 
                // For just warnings/info, show info notification
                else if (warningCount > 0 || infoCount > 0) {
                    vscode.window.showInformationMessage(message, 'View Issues').then(selection => {
                        if (selection === 'View Issues') {
                            this.showComplianceReport(templateId, validationResult);
                        }
                    });
                }
            }
            
            this.logger.debug(`Compliance validation completed for template: ${templateId}`);
        } catch (error) {
            this.logger.error(`Error validating compliance for template: ${templateId}`, error);
        }
    }
    
    /**
     * Create an organization object from the context
     * 
     * @param context The template rendering context
     * @returns Organization object for compliance validation
     */
    private createOrganizationFromContext(context: any): Organization {
        // Try to extract organization info from context
        const org = context.organization || context.org || context.company || {};
        const jurisdictions = context.jurisdictions || 
                             (context.jurisdiction ? [context.jurisdiction] : []) ||
                             org.jurisdictions || 
                             ['US']; // Default to US
        
        const frameworks = context.regulatoryFrameworks || 
                          org.regulatoryFrameworks || 
                          this.getFrameworksFromJurisdictions(jurisdictions);
        
        return {
            id: org.id || 'default-org',
            name: org.name || context.companyName || 'Default Organization',
            type: org.type || 'corporation',
            industry: Array.isArray(org.industry) ? org.industry : (org.industry ? [org.industry] : ['technology']),
            size: org.size || 100,
            jurisdictions,
            regulatoryFrameworks: frameworks,
            subsidiaries: org.subsidiaries || [],
            publiclyTraded: org.publiclyTraded === true,
            riskProfile: org.riskProfile || 'medium'
        };
    }
    
    /**
     * Infer document type from context
     * 
     * @param context The template rendering context
     * @returns Document type or undefined if can't be determined
     */
    private getDocumentTypeFromContext(context: any): string | undefined {
        // Try to determine document type from context
        if (context.documentType) {
            return context.documentType;
        }
        
        // Check title for common document types
        const title = context.title || '';
        const titleLower = title.toLowerCase();
        
        if (titleLower.includes('agreement')) {
            return 'agreement';
        } else if (titleLower.includes('contract')) {
            return 'contract';
        } else if (titleLower.includes('policy')) {
            return 'policy';
        } else if (titleLower.includes('nda') || titleLower.includes('non-disclosure')) {
            return 'agreement';
        } else if (titleLower.includes('terms') || titleLower.includes('conditions')) {
            return 'agreement';
        }
        
        return undefined;
    }
    
    /**
     * Get relevant regulatory frameworks based on jurisdictions
     * 
     * @param jurisdictions Array of jurisdiction codes
     * @returns Array of regulatory framework identifiers
     */
    private getFrameworksFromJurisdictions(jurisdictions: string[]): string[] {
        const frameworks: string[] = [];
        
        // Add relevant frameworks based on jurisdictions
        for (const jurisdiction of jurisdictions) {
            const j = jurisdiction.toUpperCase();
            
            if (j === 'US' || j === 'USA' || j === 'UNITED STATES') {
                frameworks.push('HIPAA');
                frameworks.push('CCPA');
                frameworks.push('SOX');
            }
            
            if (j === 'EU' || j === 'EUROPEAN UNION' || 
                j === 'DE' || j === 'FR' || j === 'IT' || j === 'ES' || j === 'NL') {
                frameworks.push('GDPR');
                frameworks.push('EIDAS');
            }
            
            if (j === 'UK' || j === 'UNITED KINGDOM' || j === 'GB') {
                frameworks.push('UK-GDPR');
                frameworks.push('DPA2018');
            }
            
            if (j === 'CA' || j === 'CANADA') {
                frameworks.push('PIPEDA');
            }
            
            if (j === 'AU' || j === 'AUSTRALIA') {
                frameworks.push('PRIVACY-ACT-1988');
            }
        }
        
        // Add globally applicable frameworks
        frameworks.push('ISO27001');
        
        // Return unique frameworks
        return [...new Set(frameworks)];
    }
    
    /**
     * Show compliance report in a webview
     * 
     * @param templateId ID of the template
     * @param validationResult Validation result to display
     */
    private showComplianceReport(templateId: string, validationResult: any): void {
        // Create and show webview
        const panel = vscode.window.createWebviewPanel(
            'complianceReport',
            `Compliance Report: ${templateId}`,
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );
        
        // Create HTML content
        panel.webview.html = this.generateComplianceReportHtml(templateId, validationResult);
    }
    
    /**
     * Generate HTML for compliance report
     * 
     * @param templateId ID of the template
     * @param validationResult Validation result to display
     * @returns HTML content for the webview
     */
    private generateComplianceReportHtml(templateId: string, validationResult: any): string {
        const score = Math.round(validationResult.score * 100);
        
        const criticalIssues = validationResult.issues.filter((i: any) => i.severity === 'critical');
        const errorIssues = validationResult.issues.filter((i: any) => i.severity === 'error');
        const warningIssues = validationResult.issues.filter((i: any) => i.severity === 'warning');
        const infoIssues = validationResult.issues.filter((i: any) => i.severity === 'info');
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Compliance Report</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 20px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .score {
                    font-size: 36px;
                    font-weight: bold;
                    text-align: center;
                }
                .score-circle {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px auto;
                    color: white;
                }
                .score-high {
                    background-color: #4CAF50;
                }
                .score-medium {
                    background-color: #FF9800;
                }
                .score-low {
                    background-color: #F44336;
                }
                .summary {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 30px;
                }
                .summary-item {
                    text-align: center;
                    padding: 10px;
                }
                .critical {
                    color: #F44336;
                }
                .error {
                    color: #FF5722;
                }
                .warning {
                    color: #FF9800;
                }
                .info {
                    color: #2196F3;
                }
                .issues-container {
                    margin-top: 30px;
                }
                .issue {
                    padding: 10px;
                    margin-bottom: 10px;
                    border-radius: 4px;
                }
                .issue-critical {
                    background-color: rgba(244, 67, 54, 0.1);
                    border-left: 4px solid #F44336;
                }
                .issue-error {
                    background-color: rgba(255, 87, 34, 0.1);
                    border-left: 4px solid #FF5722;
                }
                .issue-warning {
                    background-color: rgba(255, 152, 0, 0.1);
                    border-left: 4px solid #FF9800;
                }
                .issue-info {
                    background-color: rgba(33, 150, 243, 0.1);
                    border-left: 4px solid #2196F3;
                }
                .issue-header {
                    display: flex;
                    justify-content: space-between;
                }
                .issue-id {
                    font-family: monospace;
                    color: var(--vscode-textPreformat-foreground);
                }
                .recommendations {
                    margin-top: 30px;
                    padding: 15px;
                    background-color: rgba(33, 150, 243, 0.05);
                    border-radius: 4px;
                }
                .recommendation {
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid var(--vscode-editorWidget-border);
                }
                .risk-areas {
                    margin-top: 30px;
                }
                .risk-area {
                    margin-bottom: 15px;
                    padding: 15px;
                    background-color: rgba(255, 87, 34, 0.05);
                    border-radius: 4px;
                }
                h1, h2, h3 {
                    color: var(--vscode-editor-foreground);
                }
                .priority-critical {
                    color: #F44336;
                }
                .priority-high {
                    color: #FF5722;
                }
                .priority-medium {
                    color: #FF9800;
                }
                .priority-low {
                    color: #4CAF50;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Compliance Report</h1>
                <div>
                    <div class="score">
                        <div class="score-circle ${score >= 70 ? 'score-high' : (score >= 40 ? 'score-medium' : 'score-low')}">
                            ${score}%
                        </div>
                        <div>Compliance Score</div>
                    </div>
                </div>
            </div>
            
            <div class="summary">
                <div class="summary-item">
                    <h3 class="critical">${criticalIssues.length}</h3>
                    <div>Critical</div>
                </div>
                <div class="summary-item">
                    <h3 class="error">${errorIssues.length}</h3>
                    <div>Errors</div>
                </div>
                <div class="summary-item">
                    <h3 class="warning">${warningIssues.length}</h3>
                    <div>Warnings</div>
                </div>
                <div class="summary-item">
                    <h3 class="info">${infoIssues.length}</h3>
                    <div>Information</div>
                </div>
            </div>
            
            <h2>Template: ${templateId}</h2>
            
            ${this.renderIssueSection('Critical Issues', criticalIssues)}
            ${this.renderIssueSection('Errors', errorIssues)}
            ${this.renderIssueSection('Warnings', warningIssues)}
            ${this.renderIssueSection('Information', infoIssues)}
            
            <div class="recommendations">
                <h2>Recommendations</h2>
                ${validationResult.recommendations.length > 0 
                  ? validationResult.recommendations.map((rec: any) => this.renderRecommendation(rec)).join('') 
                  : '<p>No recommendations available.</p>'}
            </div>
            
            <div class="risk-areas">
                <h2>Risk Areas</h2>
                ${validationResult.riskAreas.length > 0 
                  ? validationResult.riskAreas.map((risk: any) => this.renderRiskArea(risk)).join('') 
                  : '<p>No risk areas identified.</p>'}
            </div>
        </body>
        </html>
        `;
    }
    
    /**
     * Render HTML for an issues section
     * 
     * @param title Section title
     * @param issues Array of issues to render
     * @returns HTML content for the issues section
     */
    private renderIssueSection(title: string, issues: any[]): string {
        if (issues.length === 0) {
            return '';
        }
        
        return `
        <div class="issues-container">
            <h3>${title} (${issues.length})</h3>
            ${issues.map(issue => this.renderIssue(issue)).join('')}
        </div>
        `;
    }
    
    /**
     * Render HTML for a single issue
     * 
     * @param issue Issue to render
     * @returns HTML content for the issue
     */
    private renderIssue(issue: any): string {
        return `
        <div class="issue issue-${issue.severity}">
            <div class="issue-header">
                <strong>${this.escapeHtml(issue.message)}</strong>
                <span class="issue-id">${issue.id}</span>
            </div>
            ${issue.regulatoryReference ? `
            <div class="issue-reference">
                <small>
                    <strong>${this.escapeHtml(issue.regulatoryReference.framework)}</strong>: 
                    ${this.escapeHtml(issue.regulatoryReference.description)}
                    ${issue.regulatoryReference.section ? `(Section ${this.escapeHtml(issue.regulatoryReference.section)})` : ''}
                </small>
            </div>
            ` : ''}
            ${issue.suggestedFix ? `
            <div class="issue-fix">
                <small>Suggested fix: ${this.escapeHtml(issue.suggestedFix)}</small>
            </div>
            ` : ''}
        </div>
        `;
    }
    
    /**
     * Render HTML for a recommendation
     * 
     * @param recommendation Recommendation to render
     * @returns HTML content for the recommendation
     */
    private renderRecommendation(recommendation: any): string {
        return `
        <div class="recommendation">
            <h3 class="priority-${recommendation.priority}">${this.escapeHtml(recommendation.title)}</h3>
            <p>${this.escapeHtml(recommendation.description)}</p>
            <div>
                <strong>Priority:</strong> ${recommendation.priority}
                <strong>Effort:</strong> ${recommendation.effort}
                <strong>Impact:</strong> ${Math.round(recommendation.impact * 100)}%
            </div>
            <div>
                <strong>Deadline:</strong> ${this.formatDate(recommendation.deadline)}
            </div>
            ${recommendation.steps && recommendation.steps.length > 0 ? `
            <div>
                <strong>Steps:</strong>
                <ul>
                    ${recommendation.steps.map((step: string) => `<li>${this.escapeHtml(step)}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
        `;
    }
    
    /**
     * Render HTML for a risk area
     * 
     * @param riskArea Risk area to render
     * @returns HTML content for the risk area
     */
    private renderRiskArea(riskArea: any): string {
        return `
        <div class="risk-area">
            <h3>${this.escapeHtml(riskArea.area)}</h3>
            <p>${this.escapeHtml(riskArea.impactDescription)}</p>
            <div>
                <strong>Framework:</strong> ${this.escapeHtml(riskArea.framework)}
                <strong>Risk Score:</strong> ${Math.round(riskArea.riskScore * 100)}%
                <strong>Complexity:</strong> ${riskArea.complexity}
            </div>
            <div>
                <strong>Deadline:</strong> ${this.formatDate(riskArea.deadline)}
            </div>
        </div>
        `;
    }
    
    /**
     * Format a date for display
     * 
     * @param date Date to format
     * @returns Formatted date string
     */
    private formatDate(date: Date): string {
        if (!date) {
            return 'N/A';
        }
        
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    /**
     * Escape HTML special characters
     * 
     * @param text Text to escape
     * @returns Escaped HTML string
     */
    private escapeHtml(text: string): string {
        if (!text) {
            return '';
        }
        
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
