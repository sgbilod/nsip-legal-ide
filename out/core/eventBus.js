"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
/**
 * Event bus for inter-service communication
 */
class EventBus {
    constructor() {
        this.subscriptions = new Map();
    }
    /**
     * Initialize the event bus
     */
    async initialize() {
        // No initialization needed
    }
    /**
     * Dispose the event bus
     */
    async dispose() {
        // Clear all subscriptions
        this.subscriptions.clear();
    }
    /**
     * Register an event handler
     *
     * @param event Event name
     * @param handler Event handler function
     */
    on(event, handler) {
        if (!this.subscriptions.has(event)) {
            this.subscriptions.set(event, []);
        }
        const subscriptions = this.subscriptions.get(event);
        const subscription = {
            id: this.generateId(),
            handler
        };
        subscriptions.push(subscription);
    }
    /**
     * Unregister an event handler
     *
     * @param event Event name
     * @param handler Event handler function
     */
    off(event, handler) {
        if (!this.subscriptions.has(event)) {
            return;
        }
        const subscriptions = this.subscriptions.get(event);
        const index = subscriptions.findIndex(s => s.handler === handler);
        if (index >= 0) {
            subscriptions.splice(index, 1);
        }
        if (subscriptions.length === 0) {
            this.subscriptions.delete(event);
        }
    }
    /**
     * Emit an event
     *
     * @param event Event name
     * @param data Event data
     */
    emit(event, data) {
        if (!this.subscriptions.has(event)) {
            return;
        }
        const subscriptions = this.subscriptions.get(event);
        for (const subscription of subscriptions) {
            try {
                const result = subscription.handler(data);
                if (result instanceof Promise) {
                    result.catch(err => {
                        console.error(`Error in async event handler for '${event}':`, err);
                    });
                }
            }
            catch (err) {
                console.error(`Error in event handler for '${event}':`, err);
            }
        }
    }
    /**
     * Generate a unique ID
     *
     * @returns Unique ID string
     */
    generateId() {
        return Math.random().toString(36).substring(2) +
            Date.now().toString(36);
    }
}
exports.EventBus = EventBus;
/**
 * Generate a unique ID for event subscriptions
 */
function generateUniqueId() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
//# sourceMappingURL=eventBus.js.map