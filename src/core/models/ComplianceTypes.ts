/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

export enum RiskLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export interface ComplianceRule {
    name: string;
    description: string;
    pattern?: RegExp;
    riskLevel: RiskLevel;
    recommendation: string;
    jurisdictions?: string[];
}
