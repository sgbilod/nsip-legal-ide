import { IService } from '../core/interfaces';
import { CacheOptions } from './types';
/**
 * Multi-level caching service
 */
export declare class MultiLevelCache implements IService {
    private readonly layers;
    private readonly placementStrategy;
    constructor();
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    get(key: string): Promise<any>;
    set(key: string, value: any, options?: CacheOptions): Promise<void>;
    private promote;
    private getAccessFrequency;
    private getGeographicDemand;
}
