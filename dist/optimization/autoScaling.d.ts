import { IService } from '../core/interfaces';
/**
 * Metrics for auto-scaling decisions
 */
export interface ScalingMetrics {
    cpu_usage: number;
    memory_usage: number;
    request_rate: number;
    response_time: number;
    queue_depth: number;
    error_rate: number;
}
/**
 * Load prediction
 */
export interface LoadPrediction {
    peakLoad: number;
    peakTime: number;
    duration: number;
    confidence: number;
    sustainedLow: boolean;
}
/**
 * Scaling action definition
 */
export interface ScalingAction {
    type: 'scale_out' | 'scale_in' | 'pre_scale';
    resource: 'compute' | 'memory' | 'storage' | 'all';
    amount: number;
    when?: number;
    reason?: string;
}
/**
 * Auto-scaling orchestrator service
 */
export declare class AutoScalingOrchestra implements IService {
    private metrics;
    private predictor;
    private scaler;
    private interval;
    constructor();
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    orchestrateScaling(): Promise<void>;
    private determineScalingActions;
    private executeScaling;
}
