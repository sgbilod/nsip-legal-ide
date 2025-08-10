/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import { IService, IEventEmitter, IEventHandler, EventData } from './interfaces';

/**
 * Subscription interface for event handlers
 */
interface EventSubscription<T = unknown> {
    id: string;
    handler: IEventHandler<T>;
}

/**
 * EventBus - Implements the Observer pattern for decoupled communication
 * between services in the extension
 */
export class EventBus implements IService, IEventEmitter {
    private subscriptions = new Map<string, EventSubscription<unknown>[]>();

    /**
     * Initialize the event bus
     */
    async initialize(): Promise<void> {
        // No initialization needed
    }

    /**
     * Dispose the event bus and clear all subscriptions
     */
    dispose(): void {
        this.subscriptions.clear();
    }

    /**
     * Subscribe to an event with a typed handler
     * @param event Event name
     * @param handler Event handler function
     * @param id Optional subscription ID
     */
    subscribe<T>(event: string, handler: IEventHandler<T>, id?: string): string {
        if (!this.subscriptions.has(event)) {
            this.subscriptions.set(event, []);
        }
        
        const subscriptionId = id || `${event}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        const subscription: EventSubscription<T> = {
            id: subscriptionId,
            handler
        };
        
        this.subscriptions.get(event)!.push(subscription as EventSubscription<unknown>);
        return subscriptionId;
    }

    /**
     * Unsubscribe from an event by ID
     * @param event Event name
     * @param id Subscription ID
     */
    unsubscribe(event: string, id: string): boolean {
        const subs = this.subscriptions.get(event);
        if (subs) {
            const index = subs.findIndex(sub => sub.id === id);
            if (index !== -1) {
                subs.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Publish an event with typed data
     * @param event Event name
     * @param data Event data
     */
    publish<T>(event: string, data: T): void {
        const eventData: EventData<T> = {
            type: event,
            payload: data,
            timestamp: Date.now()
        };
        this.emit(event, eventData);
    }

    /**
     * Register an event handler (implements IEventEmitter)
     * @param event Event name
     * @param handler Event handler function
     */
    on<T>(event: string, handler: IEventHandler<T>): void {
        this.subscribe<T>(event, handler);
    }

    /**
     * Unregister an event handler (implements IEventEmitter)
     * @param event Event name
     * @param handler Event handler function
     */
    off<T>(event: string, handler: IEventHandler<T>): void {
        const subs = this.subscriptions.get(event);
        if (subs) {
            const index = subs.findIndex(sub => sub.handler === handler);
            if (index !== -1) {
                subs.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event with typed data (implements IEventEmitter)
     * @param event Event name
     * @param data Event data
     */
    emit<T>(event: string, data: T): void {
        const handlers = this.subscriptions.get(event);
        if (handlers) {
            handlers.forEach(subscription => {
                try {
                    subscription.handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Unsubscribe all handlers for an event
     * @param event Event name
     */
    unsubscribeAll(event: string): void {
        this.subscriptions.delete(event);
    }
    
    /**
     * Get the number of subscribers for an event
     * @param event Event name
     * @returns Number of subscribers
     */
    getSubscriberCount(event: string): number {
        return this.subscriptions.get(event)?.length || 0;
    }
    
    /**
     * Check if an event has subscribers
     * @param event Event name
     * @returns True if the event has subscribers
     */
    hasSubscribers(event: string): boolean {
        return this.getSubscriberCount(event) > 0;
    }
}
