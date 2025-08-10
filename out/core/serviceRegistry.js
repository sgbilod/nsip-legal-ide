"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistry = void 0;
/**
 * Service Registry - A central registry for all services in the extension
 * Implements the Service Locator pattern to provide dependency management
 */
class ServiceRegistry {
    constructor() {
        this.services = new Map();
    }
    /**
     * Get the singleton instance of the ServiceRegistry
     */
    static getInstance() {
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
    register(name, service) {
        if (this.services.has(name)) {
            throw new Error(`Service with name '${name}' is already registered`);
        }
        this.services.set(name, service);
    }
    /**
     * Get a service from the registry
     * @param name Name of the service to retrieve
     * @returns The service instance
     */
    get(name) {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service with name '${name}' is not registered`);
        }
        return service;
    }
    /**
     * Check if a service is registered
     * @param name Name of the service to check
     * @returns True if the service is registered
     */
    has(name) {
        return this.services.has(name);
    }
    /**
     * Dispose all services in the registry
     */
    disposeAll() {
        for (const [name, service] of this.services.entries()) {
            try {
                service.dispose();
            }
            catch (error) {
                console.error(`Error disposing service '${name}':`, error);
            }
        }
        this.services.clear();
    }
}
exports.ServiceRegistry = ServiceRegistry;
//# sourceMappingURL=serviceRegistry.js.map