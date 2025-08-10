/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { RiskLevel, ComplianceRule } from '../models/ComplianceTypes';

export class ComplianceAnalyzerService {
    private rules: ComplianceRule[] = [];

    constructor(private readonly context: vscode.ExtensionContext) {
        this.initializeRules();
    }

    public async analyzeCompliance(document: vscode.TextDocument): Promise<any[]> {
        try {
            const text = document.getText();
            const issues = await this.checkCompliance(text);
            return issues;
        } catch (error) {
            console.error('Error analyzing compliance:', error);
            throw new Error('Failed to analyze compliance');
        }
    }

    private async checkCompliance(text: string, jurisdiction?: string): Promise<any[]> {
        const issues = [];

        for (const rule of this.rules) {
            if (jurisdiction && rule.jurisdictions && !rule.jurisdictions.includes(jurisdiction)) {
                continue;
            }

            const violations = await this.checkRule(text, rule);
            issues.push(...violations);
        }

        // Add severity scoring
        issues.forEach(issue => {
            issue.severityScore = this.calculateSeverityScore(issue.riskLevel);
        });

        return issues;
    }

    private async checkRule(text: string, rule: ComplianceRule): Promise<any[]> {
        const violations = [];

        if (rule.pattern && !rule.pattern.test(text)) {
            violations.push({
                rule: rule.name,
                description: rule.description,
                riskLevel: rule.riskLevel,
                recommendation: rule.recommendation
            });
        }

        return violations;
    }

    private calculateSeverityScore(riskLevel: RiskLevel): number {
        switch (riskLevel) {
            case RiskLevel.LOW:
                return 1;
            case RiskLevel.MEDIUM:
                return 2;
            case RiskLevel.HIGH:
                return 3;
            case RiskLevel.CRITICAL:
                return 4;
            default:
                return 0;
        }
    }

    private initializeRules(): void {
        this.rules = [
            {
                name: 'Data Protection Clause',
                description: 'Document must include data protection and privacy clauses',
                pattern: /\b(data protection|privacy|personal data|GDPR)\b/i,
                riskLevel: RiskLevel.HIGH,
                recommendation: 'Add appropriate data protection and privacy clauses'
            },
            {
                name: 'Liability Limitation',
                description: 'Document should include liability limitation clauses',
                pattern: /\b(liability|limitation of liability|damages)\b/i,
                riskLevel: RiskLevel.MEDIUM,
                recommendation: 'Include liability limitation clauses'
            },
            {
                name: 'Governing Law',
                description: 'Document must specify governing law',
                pattern: /\b(governing law|jurisdiction|applicable law)\b/i,
                riskLevel: RiskLevel.HIGH,
                recommendation: 'Specify the governing law and jurisdiction'
            }
        ];
    }

    public addRule(rule: ComplianceRule): void {
        this.rules.push(rule);
    }

    public addJurisdictionSpecificRule(rule: ComplianceRule): void {
        if (!rule.jurisdictions) {
            throw new Error('Jurisdiction-specific rules must include jurisdictions');
        }
        this.rules.push(rule);
    }
}
