/**
 * Advanced Features Module Registry
 *
 * This module integrates all the advanced AI/ML and automation components
 * and provides a centralized registration and access point.
 */
import { IService } from '../core/interfaces';
import { ServiceRegistry } from '../core/serviceRegistry';
import { EventBus } from '../core/eventBus';
import { Logger } from '../core/logger';
/**
 * Advanced Features Registry
 *
 * Provides centralized management for all advanced AI/ML and automation
 * features in the NSIP Legal/Business IDE.
 */
export declare class AdvancedFeaturesRegistry implements IService {
    private logger;
    private eventBus;
    private serviceRegistry;
    private services;
    private initialized;
    constructor(logger: Logger, eventBus: EventBus, serviceRegistry: ServiceRegistry);
    /**
     * Initialize all advanced features
     */
    initialize(): Promise<void>;
    /**
     * Dispose all advanced features
     */
    dispose(): Promise<void>;
    /**
     * Get a specific advanced feature service
     *
     * @param name Service name
     * @returns The service instance or null if not found
     */
    getService<T extends IService>(name: string): T | null;
    /**
     * Register a service
     *
     * @param name Service name
     * @param service Service instance
     */
    private registerService;
}
export declare function createAdvancedFeaturesRegistry(logger: Logger, eventBus: EventBus, serviceRegistry: ServiceRegistry): AdvancedFeaturesRegistry;
