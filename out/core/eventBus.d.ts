/**
 * Interface for services
 */
interface IService {
    initialize(): Promise<void>;
    dispose(): Promise<void>;
}
/**
 * Interface for event emitters
 */
interface IEventEmitter {
    on(event: string, handler: (data: any) => void | Promise<void>): void;
    off(event: string, handler: (data: any) => void | Promise<void>): void;
    emit(event: string, data: any): void;
}
/**
 * Event bus for inter-service communication
 */
export declare class EventBus implements IService, IEventEmitter {
    private subscriptions;
    /**
     * Initialize the event bus
     */
    initialize(): Promise<void>;
    /**
     * Dispose the event bus
     */
    dispose(): Promise<void>;
    /**
     * Register an event handler
     *
     * @param event Event name
     * @param handler Event handler function
     */
    on(event: string, handler: (data: any) => void | Promise<void>): void;
    /**
     * Unregister an event handler
     *
     * @param event Event name
     * @param handler Event handler function
     */
    off(event: string, handler: (data: any) => void | Promise<void>): void;
    /**
     * Emit an event
     *
     * @param event Event name
     * @param data Event data
     */
    emit(event: string, data: any): void;
    /**
     * Generate a unique ID
     *
     * @returns Unique ID string
     */
    private generateId;
}
/**
 * Interface that all services must implement
 */
export interface IService {
    initialize(): Promise<void>;
    dispose(): void;
}
export {};
