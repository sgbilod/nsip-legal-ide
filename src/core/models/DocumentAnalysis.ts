/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

export interface Clause {
    category: string;
    text: string;
}

export interface DocumentAnalysis {
    clauses: Clause[];
    entities: string[];
    risks: any[];
    sentimentScores: number[];
    suggestions?: string[];
    timestamp: Date;
    version: string;
}
