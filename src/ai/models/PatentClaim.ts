/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

export interface PatentClaim {
    id: string;
    type: 'independent' | 'dependent';
    text: string;
    dependencies: string[];
    elements: string[];
    scope: {
        broad: boolean;
        specific: boolean;
        novel: boolean;
    };
    analysis: {
        novelty: number;
        clarity: number;
        support: number;
    };
    references: {
        specs: string[];
        drawings: string[];
    };
}
