/**
 * Service Registry - A central registry for all services in the extension
 * Implements the Service Locator pattern to provide dependency management
 */
export declare class ServiceRegistry {
    private static instance;
    private services;
    /**
     * Get the singleton instance of the ServiceRegistry
     */
    static getInstance(): ServiceRegistry;
    /**
     * Register a service with the registry
     * @param name Unique name for the service
     * @param service Service instance
     */
    register<T extends IService>(name: string, service: T): void;
    /**
     * Get a service from the registry
     * @param name Name of the service to retrieve
     * @returns The service instance
     */
    get<T extends IService>(name: string): T;
    /**
     * Check if a service is registered
     * @param name Name of the service to check
     * @returns True if the service is registered
     */
    has(name: string): boolean;
    /**
     * Dispose all services in the registry
     */
    disposeAll(): void;
}
/**
 * Interface for all services in the extension
 */
export interface IService {
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Dispose the service
     */
    dispose(): void;
}
