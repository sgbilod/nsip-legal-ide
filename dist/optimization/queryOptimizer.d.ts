import { IService } from '../core/interfaces';
/**
 * Query context information
 */
export interface QueryContext {
    userId: string;
    documentId?: string;
    transactionId: string;
    priority: 'low' | 'normal' | 'high';
    timeout?: number;
}
/**
 * Query analysis result
 */
export interface QueryAnalysis {
    hash: string;
    type: 'select' | 'insert' | 'update' | 'delete';
    tables: string[];
    conditions: string[];
    joins: string[];
    projections: string[];
    complexity: number;
    estimatedRows: number;
}
/**
 * Query plan information
 */
export interface QueryPlan {
    hash: string;
    cost: number;
    steps: QueryPlanStep[];
    indexes: string[];
    partitions: string[];
    cacheStrategy: string;
    valid: boolean;
}
/**
 * Query plan step
 */
export interface QueryPlanStep {
    type: string;
    table: string;
    operation: string;
    cost: number;
    rows: number;
}
/**
 * Index information
 */
export interface IndexInfo {
    name: string;
    table: string;
    columns: string[];
    type: 'btree' | 'hash' | 'gin' | 'gist';
    unique: boolean;
    partial?: string;
}
/**
 * Query optimization result
 */
export interface OptimizedQuery {
    sql: string;
    plan: QueryPlan;
    suggestedIndexes: IndexInfo[];
    cacheStrategy: string;
    partitionStrategy?: string;
    estimated: {
        cost: number;
        rows: number;
        executionTime: number;
    };
}
/**
 * Query optimizer service
 */
export declare class QueryOptimizer implements IService {
    private queryAnalyzer;
    private indexAdvisor;
    private planCache;
    constructor();
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    optimizeQuery(query: string, context: QueryContext): Promise<OptimizedQuery>;
    private isPlanValid;
    private generateStrategies;
    private testStrategy;
    private selectBestStrategy;
    private createQueryPlan;
    private rewriteQuery;
    private createOptimizedQuery;
}
