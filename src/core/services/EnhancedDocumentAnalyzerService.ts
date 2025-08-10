/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { DocumentAnalysis } from '../models/DocumentAnalysis';

export class EnhancedDocumentAnalyzerService {
    private readonly supportedLanguages = ['markdown', 'nsip-legal'];

    constructor(private readonly context: vscode.ExtensionContext) {}

    public async analyzeDocument(document: vscode.TextDocument): Promise<DocumentAnalysis> {
        try {
            if (!this.supportedLanguages.includes(document.languageId)) {
                throw new Error('Unsupported document type');
            }

            const text = document.getText();
            const analysis = await this.performAnalysis(text);
            return analysis;
        } catch (error) {
            console.error('Error analyzing document:', error);
            throw new Error('Failed to analyze document');
        }
    }

    private async performAnalysis(text: string): Promise<DocumentAnalysis> {
        const clauses = await this.extractClauses(text);
        const entities = await this.extractEntities(text);
        const risks = await this.assessRisks(text, clauses, entities);
        const sentiment = await this.analyzeSentiment(text);
        const keywords = await this.extractKeywords(text);

        return {
            clauses,
            entities,
            risks,
            sentiment,
            keywords,
            timestamp: new Date(),
            version: '1.1.0'
        };
    }

    private async extractClauses(text: string): Promise<string[]> {
        const clauseRegex = /\b(WHEREAS|PROVIDED THAT|SUBJECT TO|NOTWITHSTANDING|HEREBY)\b.*?[.;]/gi;
        return Array.from(text.matchAll(clauseRegex)).map(match => match[0].trim());
    }

    private async extractEntities(text: string): Promise<string[]> {
        const entityRegex = /\b([A-Z][A-Za-z]* (?:[A-Z][A-Za-z]* )*(?:Inc\.|LLC|Ltd\.|Corp\.|Corporation|Company))\b/g;
        return Array.from(text.matchAll(entityRegex)).map(match => match[0].trim());
    }

    private async assessRisks(text: string, clauses: string[], entities: string[]): Promise<any[]> {
        // TODO: Implement risk assessment
        return [];
    }

    private async analyzeSentiment(text: string): Promise<string> {
        // TODO: Implement sentiment analysis
        return 'Neutral';
    }

    private async extractKeywords(text: string): Promise<string[]> {
        const keywordRegex = /\b[A-Za-z]{5,}\b/g;
        const keywords = Array.from(text.matchAll(keywordRegex)).map(match => match[0].toLowerCase());
        const uniqueKeywords = Array.from(new Set(keywords));
        return uniqueKeywords;
    }
}
