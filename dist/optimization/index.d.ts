export * from './cachingStrategy';
export * from './queryOptimizer';
export * from './resourceManager';
export * from './autoScaling';
export type { CacheOptions, CacheAnalysis, CachePlacement, ICache, CacheStats, CircuitState, ErrorThreshold, GeographicDemand } from './types';
export type { QueryContext, QueryAnalysis, QueryPlan, QueryPlanStep, IndexInfo, OptimizedQuery } from './queryOptimizer';
export type { ResourceAllocation, ResourceMetrics, ResourceConstraints, ResourcePrediction } from './resourceManager';
export type { ScalingMetrics, LoadPrediction, ScalingAction } from './autoScaling';
