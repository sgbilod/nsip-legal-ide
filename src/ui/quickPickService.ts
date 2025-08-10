import * as vscode from 'vscode';
import { IService } from '../core/interfaces';
import { Logger } from '../core/logger';

/**
 * Interface for the quick pick service
 */
export interface IQuickPickService extends IService {
    /**
     * Show a quick pick for document templates
     * @returns The selected template path or undefined if cancelled
     */
    showTemplateQuickPick(): Promise<string | undefined>;
    
    /**
     * Show a quick pick for compliance rules
     * @returns The selected rule ID or undefined if cancelled
     */
    showComplianceRuleQuickPick(): Promise<string | undefined>;
    
    /**
     * Show a quick pick for legal actions
     * @returns The selected action ID or undefined if cancelled
     */
    showLegalActionQuickPick(): Promise<string | undefined>;
}

/**
 * Template item for quick pick
 */
interface TemplateQuickPickItem extends vscode.QuickPickItem {
    path: string;
}

/**
 * Rule item for quick pick
 */
interface RuleQuickPickItem extends vscode.QuickPickItem {
    id: string;
}

/**
 * Action item for quick pick
 */
interface ActionQuickPickItem extends vscode.QuickPickItem {
    id: string;
}

/**
 * Implementation of the quick pick service
 */
export class QuickPickService implements IQuickPickService {
    private logger: Logger;
    
    // Template cache
    private templateItems: TemplateQuickPickItem[] = [];
    
    // Rule cache
    private ruleItems: RuleQuickPickItem[] = [];
    
    constructor(logger: Logger) {
        this.logger = logger;
    }
    
    public async initialize(): Promise<void> {
        // Initialize template items
        await this.refreshTemplateItems();
        
        this.logger.debug('QuickPickService initialized');
    }
    
    public dispose(): void {
        this.logger.debug('QuickPickService disposed');
    }
    
    public async showTemplateQuickPick(): Promise<string | undefined> {
        // Refresh templates first
        await this.refreshTemplateItems();
        
        // Show quick pick
        const selected = await vscode.window.showQuickPick(this.templateItems, {
            placeHolder: 'Select a document template',
            matchOnDescription: true,
            matchOnDetail: true
        });
        
        return selected ? selected.path : undefined;
    }
    
    public async showComplianceRuleQuickPick(): Promise<string | undefined> {
        // Refresh rules first
        await this.refreshRuleItems();
        
        // Show quick pick
        const selected = await vscode.window.showQuickPick(this.ruleItems, {
            placeHolder: 'Select a compliance rule',
            matchOnDescription: true,
            matchOnDetail: true
        });
        
        return selected ? selected.id : undefined;
    }
    
    public async showLegalActionQuickPick(): Promise<string | undefined> {
        // Legal actions are static for now
        const actionItems: ActionQuickPickItem[] = [
            {
                label: '$(file-add) Create New Document',
                description: 'Create a new document from a template',
                id: 'create-document'
            },
            {
                label: '$(law) Run Compliance Check',
                description: 'Validate the current document against compliance rules',
                id: 'run-compliance'
            },
            {
                label: '$(checklist) Generate Compliance Report',
                description: 'Generate a detailed compliance report for the current document',
                id: 'generate-report'
            },
            {
                label: '$(references) Cross-Reference Check',
                description: 'Check document cross-references and citations',
                id: 'cross-reference'
            },
            {
                label: '$(globe) Jurisdiction Analysis',
                description: 'Analyze document for jurisdiction-specific requirements',
                id: 'jurisdiction'
            }
        ];
        
        // Show quick pick
        const selected = await vscode.window.showQuickPick(actionItems, {
            placeHolder: 'Select a legal action',
            matchOnDescription: true
        });
        
        return selected ? selected.id : undefined;
    }
    
    /**
     * Refresh the template items cache
     */
    private async refreshTemplateItems(): Promise<void> {
        try {
            // For now, we'll use some mock templates
            // In a real implementation, this would load from templates directory
            this.templateItems = [
                {
                    label: '$(file-code) Contract Template',
                    description: 'Standard contract template',
                    detail: 'Basic contract with standard clauses',
                    path: 'templates/contract.hbs'
                },
                {
                    label: '$(file-code) NDA Template',
                    description: 'Non-disclosure agreement',
                    detail: 'Standard NDA with confidentiality clauses',
                    path: 'templates/nda.hbs'
                },
                {
                    label: '$(file-code) License Agreement',
                    description: 'Software license agreement',
                    detail: 'Standard license for software products',
                    path: 'templates/license.hbs'
                },
                {
                    label: '$(file-code) Privacy Policy',
                    description: 'Website privacy policy',
                    detail: 'GDPR compliant privacy policy template',
                    path: 'templates/privacy.hbs'
                },
                {
                    label: '$(file-code) Terms of Service',
                    description: 'Website terms of service',
                    detail: 'Standard terms for web services',
                    path: 'templates/terms.hbs'
                }
            ];
            
            this.logger.debug(`Refreshed ${this.templateItems.length} template items`);
        } catch (error) {
            this.logger.error(`Error refreshing templates: ${error}`);
            this.templateItems = [];
        }
    }
    
    /**
     * Refresh the rule items cache
     */
    private async refreshRuleItems(): Promise<void> {
        try {
            // For now, we'll use mock rules
            // In a real implementation, this would load from a compliance engine
            this.ruleItems = [
                {
                    label: '$(shield) GDPR Compliance',
                    description: 'General Data Protection Regulation',
                    detail: 'EU data protection and privacy rules',
                    id: 'gdpr'
                },
                {
                    label: '$(shield) CCPA Compliance',
                    description: 'California Consumer Privacy Act',
                    detail: 'California privacy regulations',
                    id: 'ccpa'
                },
                {
                    label: '$(shield) HIPAA Compliance',
                    description: 'Health Insurance Portability and Accountability Act',
                    detail: 'US healthcare data privacy rules',
                    id: 'hipaa'
                },
                {
                    label: '$(shield) SOX Compliance',
                    description: 'Sarbanes-Oxley Act',
                    detail: 'Financial reporting and governance',
                    id: 'sox'
                },
                {
                    label: '$(shield) PCI DSS',
                    description: 'Payment Card Industry Data Security Standard',
                    detail: 'Credit card processing security',
                    id: 'pci'
                }
            ];
            
            this.logger.debug(`Refreshed ${this.ruleItems.length} rule items`);
        } catch (error) {
            this.logger.error(`Error refreshing rules: ${error}`);
            this.ruleItems = [];
        }
    }
}
