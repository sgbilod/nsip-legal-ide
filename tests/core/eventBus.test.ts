import { EventBus } from '../../src/core/eventBus';
import { EventData } from '../../src/core/interfaces';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  it('should initialize without errors', async () => {
    await expect(eventBus.initialize()).resolves.toBeUndefined();
  });

  it('should subscribe and emit events', () => {
    const handler = jest.fn();
    eventBus.on<string>('test-event', handler);
    
    eventBus.emit<string>('test-event', 'hello');
    
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('should publish events with proper event data', () => {
    const handler = jest.fn();
    eventBus.on<EventData<string>>('test-event', handler);
    
    eventBus.publish<string>('test-event', 'hello');
    
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      type: 'test-event',
      payload: 'hello',
      timestamp: expect.any(Number)
    }));
  });

  it('should unsubscribe events by handler', () => {
    const handler = jest.fn();
    eventBus.on<string>('test-event', handler);
    
    eventBus.off<string>('test-event', handler);
    eventBus.emit<string>('test-event', 'hello');
    
    expect(handler).not.toHaveBeenCalled();
  });

  it('should unsubscribe events by ID', () => {
    const handler = jest.fn();
    const id = eventBus.subscribe<string>('test-event', handler);
    
    eventBus.unsubscribe('test-event', id);
    eventBus.emit<string>('test-event', 'hello');
    
    expect(handler).not.toHaveBeenCalled();
  });

  it('should unsubscribe all events for a given type', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    
    eventBus.on<string>('test-event', handler1);
    eventBus.on<string>('test-event', handler2);
    
    eventBus.unsubscribeAll('test-event');
    eventBus.emit<string>('test-event', 'hello');
    
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should handle errors in event handlers', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const handler = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    
    eventBus.on<string>('test-event', handler);
    eventBus.emit<string>('test-event', 'hello');
    
    expect(handler).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should return subscriber count', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    
    eventBus.on<string>('test-event', handler1);
    eventBus.on<string>('test-event', handler2);
    
    expect(eventBus.getSubscriberCount('test-event')).toBe(2);
    expect(eventBus.getSubscriberCount('non-existent-event')).toBe(0);
  });

  it('should check if an event has subscribers', () => {
    const handler = jest.fn();
    
    eventBus.on<string>('test-event', handler);
    
    expect(eventBus.hasSubscribers('test-event')).toBe(true);
    expect(eventBus.hasSubscribers('non-existent-event')).toBe(false);
  });

  it('should dispose and clear all subscriptions', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    
    eventBus.on<string>('event1', handler1);
    eventBus.on<string>('event2', handler2);
    
    eventBus.dispose();
    
    eventBus.emit<string>('event1', 'hello');
    eventBus.emit<string>('event2', 'world');
    
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
});
