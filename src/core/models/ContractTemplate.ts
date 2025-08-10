/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

export interface ContractTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    variables: TemplateVariable[];
    category: string;
    tags: string[];
    version: string;
    lastModified: Date;
    author: string;
    history: TemplateHistory[];
}

export interface TemplateVariable {
    name: string;
    description: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    defaultValue?: any;
    required: boolean;
    validation?: {
        pattern?: string;
        min?: number;
        max?: number;
        options?: string[];
    };
}

export interface TemplateHistory {
    version: string;
    modifiedDate: Date;
    changes: string;
}
