/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import { IService } from './interfaces';

/**
 * Service Registry - A central registry for all services in the extension
 * Implements the Service Locator pattern to provide dependency management
 */
export class ServiceRegistry {
    private static instance: ServiceRegistry;
    private services: Map<string, IService> = new Map();
    
    /**
     * Get the singleton instance of the ServiceRegistry
     */
    static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }
    
    /**
     * Register a service with the registry
     * @param name Unique name for the service
     * @param service Service instance
     */
    register<T extends IService>(name: string, service: T): void {
        if (this.services.has(name)) {
            throw new Error(`Service with name '${name}' is already registered`);
        }
        this.services.set(name, service);
    }
    
    /**
     * Get a service from the registry
     * @param name Name of the service to retrieve
     * @returns The service instance
     * @throws Error if service is not registered
     */
    get<T extends IService>(name: string): T {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service with name '${name}' is not registered`);
        }
        return service as T;
    }
    
    /**
     * Check if a service is registered
     * @param name Name of the service to check
     * @returns True if the service is registered
     */
    has(name: string): boolean {
        return this.services.has(name);
    }
    
    /**
     * Dispose all services in the registry
     */
    disposeAll(): void {
        for (const [name, service] of this.services.entries()) {
            try {
                service.dispose();
            } catch (error) {
                console.error(`Error disposing service '${name}':`, error);
            }
        }
        this.services.clear();
    }
}

export { IService };
