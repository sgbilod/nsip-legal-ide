/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { ContractTemplate, TemplateVariable } from '../models/ContractTemplate';

export class DocumentGeneratorService {
    constructor(private readonly context: vscode.ExtensionContext) {}

    public async generateDocument(template: ContractTemplate, variables: Record<string, any>): Promise<string> {
        try {
            // Validate variables
            this.validateVariables(template.variables, variables);

            // Generate document content
            let content = template.content;
            
            // Replace variables in content
            for (const [key, value] of Object.entries(variables)) {
                const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
                content = content.replace(regex, String(value));
            }

            // Add metadata
            content = this.addMetadata(content, template);

            return content;
        } catch (error) {
            console.error('Error generating document:', error);
            throw new Error('Failed to generate document');
        }
    }

    private validateVariables(templateVars: TemplateVariable[], providedVars: Record<string, any>): void {
        for (const variable of templateVars) {
            // Check required variables
            if (variable.required && !(variable.name in providedVars)) {
                throw new Error(`Missing required variable: ${variable.name}`);
            }

            const value = providedVars[variable.name];
            if (value !== undefined) {
                // Type validation
                switch (variable.type) {
                    case 'string':
                        if (typeof value !== 'string') {
                            throw new Error(`Variable ${variable.name} must be a string`);
                        }
                        break;
                    case 'number':
                        if (typeof value !== 'number') {
                            throw new Error(`Variable ${variable.name} must be a number`);
                        }
                        break;
                    case 'boolean':
                        if (typeof value !== 'boolean') {
                            throw new Error(`Variable ${variable.name} must be a boolean`);
                        }
                        break;
                    case 'date':
                        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
                            throw new Error(`Variable ${variable.name} must be a valid date`);
                        }
                        break;
                }

                // Pattern validation
                if (variable.validation?.pattern && typeof value === 'string') {
                    const regex = new RegExp(variable.validation.pattern);
                    if (!regex.test(value)) {
                        throw new Error(`Variable ${variable.name} does not match required pattern`);
                    }
                }

                // Range validation for numbers
                if (variable.type === 'number') {
                    if (variable.validation?.min !== undefined && value < variable.validation.min) {
                        throw new Error(`Variable ${variable.name} must be at least ${variable.validation.min}`);
                    }
                    if (variable.validation?.max !== undefined && value > variable.validation.max) {
                        throw new Error(`Variable ${variable.name} must be at most ${variable.validation.max}`);
                    }
                }

                // Options validation
                if (variable.validation?.options && !variable.validation.options.includes(value)) {
                    throw new Error(`Variable ${variable.name} must be one of: ${variable.validation.options.join(', ')}`);
                }
            }
        }
    }

    private addMetadata(content: string, template: ContractTemplate): string {
        const metadata = `
<!--
Document generated from template: ${template.name}
Template ID: ${template.id}
Template Version: ${template.version}
Generated on: ${new Date().toISOString()}
-->

`;
        return metadata + content;
    }
}
