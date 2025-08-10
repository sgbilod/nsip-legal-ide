/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import { IService } from '../core/interfaces';
import { Logger } from '../core/logger';
import { LegalResearchQuery } from './models/LegalResearchQuery';
import { LegalResearchResult } from './models/LegalResearchResult';
import { LexisNexisService } from './services/LexisNexisService';
import { WestlawService } from './services/WestlawService';

export class LegalResearchIntegration implements IService {
    private logger: Logger;
    private lexisNexisService: LexisNexisService;
    private westlawService: WestlawService;

    constructor(
        logger: Logger,
        lexisNexisService: LexisNexisService,
        westlawService: WestlawService
    ) {
        this.logger = logger;
        this.lexisNexisService = lexisNexisService;
        this.westlawService = westlawService;
    }

    public async initialize(): Promise<void> {
        await Promise.all([
            this.lexisNexisService.initialize(),
            this.westlawService.initialize()
        ]);
    }

    public dispose(): void {
        this.lexisNexisService.dispose();
        this.westlawService.dispose();
    }

    public async searchLegalResources(query: LegalResearchQuery): Promise<LegalResearchResult[]> {
        try {
            const [lexisResults, westlawResults] = await Promise.all([
                this.lexisNexisService.search(query),
                this.westlawService.search(query)
            ]);

            return this.mergeResults(lexisResults, westlawResults);
        } catch (error) {
            this.logger.error('Error searching legal resources:', error);
            throw new Error('Failed to search legal resources');
        }
    }

    public async getCitation(docId: string, service: 'lexis' | 'westlaw'): Promise<string> {
        try {
            if (service === 'lexis') {
                return await this.lexisNexisService.getCitation(docId);
            } else {
                return await this.westlawService.getCitation(docId);
            }
        } catch (error) {
            this.logger.error('Error getting citation:', error);
            throw new Error('Failed to get citation');
        }
    }

    public async getFullText(docId: string, service: 'lexis' | 'westlaw'): Promise<string> {
        try {
            if (service === 'lexis') {
                return await this.lexisNexisService.getFullText(docId);
            } else {
                return await this.westlawService.getFullText(docId);
            }
        } catch (error) {
            this.logger.error('Error getting full text:', error);
            throw new Error('Failed to get full text');
        }
    }

    private mergeResults(
        lexisResults: LegalResearchResult[],
        westlawResults: LegalResearchResult[]
    ): LegalResearchResult[] {
        // Implement result merging and deduplication logic
        return [...lexisResults, ...westlawResults]; // Placeholder
    }
}
