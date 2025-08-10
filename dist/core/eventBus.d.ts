import { IService } from './interfaces';
interface IEventEmitter {
    on(event: string, handler: (data: any) => void | Promise<void>): void;
    off(event: string, handler: (data: any) => void | Promise<void>): void;
    emit(event: string, data: any): void;
}
export declare class EventBus implements IService, IEventEmitter {
    private subscriptions;
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    subscribe<T>(event: string, handler: (data: T) => void | Promise<void>, id?: string): void;
    unsubscribe(event: string, id: string): void;
    publish<T>(event: string, data: T): void;
    on(event: string, handler: (data: any) => void | Promise<void>): void;
    off(event: string, handler: (data: any) => void | Promise<void>): void;
    emit(event: string, data: any): void;
    unsubscribeAll(event: string): void;
}
export {};
