/**
 * Core Interfaces
 *
 * This module defines core interfaces used throughout the NSIP Legal IDE.
 */
/**
 * Interface for services that can be initialized and disposed
 */
export interface IService {
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Dispose the service and release resources
     */
    dispose(): Promise<void>;
}
/**
 * Interface for service provider that can register and access services
 */
export interface IServiceProvider {
    /**
     * Get a service by type
     *
     * @param type Service type to retrieve
     * @returns The service instance
     */
    getService<T>(type: string): T | null;
}
/**
 * Interface for event handlers
 */
export interface IEventHandler {
    (data: any): void | Promise<void>;
}
/**
 * Interface for event emitters
 */
export interface IEventEmitter {
    /**
     * Register an event handler
     *
     * @param event Event name
     * @param handler Event handler function
     */
    on(event: string, handler: IEventHandler): void;
    /**
     * Unregister an event handler
     *
     * @param event Event name
     * @param handler Event handler function
     */
    off(event: string, handler: IEventHandler): void;
    /**
     * Emit an event
     *
     * @param event Event name
     * @param data Event data
     */
    emit(event: string, data: any): void;
}
/**
 * Interface for logging
 */
export interface ILogger {
    /**
     * Log a debug message
     *
     * @param message Log message
     * @param data Optional data to log
     */
    debug(message: string, data?: any): void;
    /**
     * Log an info message
     *
     * @param message Log message
     * @param data Optional data to log
     */
    info(message: string, data?: any): void;
    /**
     * Log a warning message
     *
     * @param message Log message
     * @param data Optional data to log
     */
    warn(message: string, data?: any): void;
    /**
     * Log an error message
     *
     * @param message Log message
     * @param data Optional data to log
     */
    error(message: string, data?: any): void;
}
