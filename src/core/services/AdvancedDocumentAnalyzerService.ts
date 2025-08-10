/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { DocumentAnalysis, Clause } from '../models/DocumentAnalysis';

export class AdvancedDocumentAnalyzerService {
    private readonly supportedLanguages = ['markdown', 'nsip-legal'];

    constructor() {}

    public async analyzeDocument(document: vscode.TextDocument): Promise<DocumentAnalysis> {
        try {
            if (!this.supportedLanguages.includes(document.languageId)) {
                throw new Error('Unsupported document type');
            }

            const text = document.getText();
            const clauses = await this.extractClauses(text);
            const categorizedClauses = await this.categorizeClauses(clauses);
            const entities = await this.extractEntities(text);
            const sentimentScores = await this.analyzeSentiment(clauses);

            return {
                clauses: categorizedClauses.map(c => c.clause),
                entities,
                sentimentScores,
                timestamp: new Date(),
                version: '2.0.0'
            };
        } catch (error) {
            console.error('Error analyzing document:', error);
            throw new Error('Failed to analyze document');
        }
    }

    private async extractClauses(text: string): Promise<string[]> {
        const clauseRegex = /\b(WHEREAS|PROVIDED THAT|SUBJECT TO|NOTWITHSTANDING|HEREBY)\b.*?[.;]/gi;
        return Array.from(text.matchAll(clauseRegex)).map(match => match[0].trim());
    }

    private async categorizeClauses(clauses: string[]): Promise<{ clause: string; category: string }[]> {
        const categories = ['Obligation', 'Right', 'Condition', 'Exclusion'];
        return clauses.map(clause => {
            const category = categories.find(cat => clause.toLowerCase().includes(cat.toLowerCase())) || 'Uncategorized';
            return { clause, category };
        });
    }

    private async extractEntities(text: string): Promise<string[]> {
        const entityRegex = /\b([A-Z][A-Za-z]* (?:[A-Z][A-Za-z]* )*(?:Inc\.|LLC|Ltd\.|Corp\.|Corporation|Company))\b/g;
        return Array.from(text.matchAll(entityRegex)).map(match => match[0].trim());
    }

    private async analyzeSentiment(clauses: string[]): Promise<{ clause: string; sentiment: string }[]> {
        return clauses.map(clause => {
            const sentiment = clause.includes('not') || clause.includes('no') ? 'Negative' : 'Positive';
            return { clause, sentiment };
        });
    }

    static async analyze(text: string): Promise<DocumentAnalysis> {
        // Dummy implementation for demonstration
        const clauses: Clause[] = [
            { category: 'Confidentiality', text: 'This document contains confidential information.' },
            { category: 'Termination', text: 'The agreement may be terminated under certain conditions.' }
        ];
        const sentimentScores: number[] = [0.8, 0.2];
    const suggestions = ['Consider adding a dispute resolution clause.', 'Clarify the termination conditions.'];
    const entities = ['Party A', 'Party B'];
    const risks = ['Ambiguous termination clause'];
    const timestamp = new Date();
    const version = '1.0';
    return { clauses, sentimentScores, suggestions, entities, risks, timestamp, version };
    }
}
