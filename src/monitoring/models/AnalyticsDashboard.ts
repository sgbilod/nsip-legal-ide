/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

export interface AnalyticsDashboard {
    id: string;
    name: string;
    metrics: {
        documentCount: number;
        activeCollaborators: number;
        averageResponseTime: number;
        completionRate: number;
    };
    charts: {
        [key: string]: {
            type: 'line' | 'bar' | 'pie';
            data: any[];
            options: any;
        };
    };
    filters: {
        dateRange: {
            start: Date;
            end: Date;
        };
        categories: string[];
        users: string[];
    };
}
