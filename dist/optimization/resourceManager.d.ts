import { IService } from '../core/interfaces';
/**
 * Resource allocation configuration
 */
export interface ResourceAllocation {
    compute: {
        cpu: number;
        memory: number;
        instances: number;
    };
    storage: {
        size: number;
        type: string;
        iops: number;
    };
    network: {
        bandwidth: number;
        latency: number;
    };
    cost: {
        hourly: number;
        daily: number;
        monthly: number;
    };
}
/**
 * Resource metrics
 */
export interface ResourceMetrics {
    cpu: {
        usage: number;
        load: number;
        temperature: number;
    };
    memory: {
        used: number;
        available: number;
        swapUsage: number;
    };
    network: {
        inbound: number;
        outbound: number;
        latency: number;
        errors: number;
    };
    storage: {
        used: number;
        available: number;
        iops: number;
        latency: number;
    };
}
/**
 * Resource constraints
 */
export interface ResourceConstraints {
    maxCost: number;
    minPerformance: number;
    maxLatency: number;
    minAvailability: number;
}
/**
 * Resource prediction
 */
export interface ResourcePrediction {
    timestamp: number;
    duration: number;
    metrics: ResourceMetrics;
    confidence: number;
}
/**
 * Intelligent resource manager service
 */
export declare class IntelligentResourceManager implements IService {
    private predictor;
    private optimizer;
    private currentAllocation;
    constructor();
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    optimizeResources(): Promise<void>;
    private getDefaultAllocation;
    private applyOptimizations;
    private scaleCompute;
    private adjustStorage;
    private updateNetwork;
}
