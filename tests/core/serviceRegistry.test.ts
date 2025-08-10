import { ServiceRegistry, IService } from '../../src/core/serviceRegistry';

// Mock service implementation
class MockService implements IService {
  initialize = jest.fn().mockResolvedValue(undefined);
  dispose = jest.fn();
}

describe('ServiceRegistry', () => {
  let serviceRegistry: ServiceRegistry;
  let mockService: MockService;

  beforeEach(() => {
    // Reset the singleton instance before each test
    // @ts-ignore: Accessing private static property for testing
    ServiceRegistry.instance = undefined;
    
    serviceRegistry = ServiceRegistry.getInstance();
    mockService = new MockService();
  });

  it('should be a singleton', () => {
    const instance1 = ServiceRegistry.getInstance();
    const instance2 = ServiceRegistry.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should register and retrieve a service', () => {
    serviceRegistry.register('test', mockService);
    expect(serviceRegistry.has('test')).toBe(true);
    
    const retrievedService = serviceRegistry.get<MockService>('test');
    expect(retrievedService).toBe(mockService);
  });

  it('should throw an error when registering a duplicate service', () => {
    serviceRegistry.register('test', mockService);
    
    expect(() => {
      serviceRegistry.register('test', new MockService());
    }).toThrow("Service with name 'test' is already registered");
  });

  it('should throw an error when retrieving a non-existent service', () => {
    expect(() => {
      serviceRegistry.get('nonexistent');
    }).toThrow("Service with name 'nonexistent' is not registered");
  });

  it('should dispose all services', () => {
    const mockService2 = new MockService();
    
    serviceRegistry.register('test1', mockService);
    serviceRegistry.register('test2', mockService2);
    
    serviceRegistry.disposeAll();
    
    expect(mockService.dispose).toHaveBeenCalled();
    expect(mockService2.dispose).toHaveBeenCalled();
    expect(serviceRegistry.has('test1')).toBe(false);
    expect(serviceRegistry.has('test2')).toBe(false);
  });

  it('should handle errors during disposal', () => {
    const errorService = {
      initialize: jest.fn().mockResolvedValue(undefined),
      dispose: jest.fn().mockImplementation(() => {
        throw new Error('Disposal error');
      })
    };
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    serviceRegistry.register('errorService', errorService);
    serviceRegistry.disposeAll();
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(serviceRegistry.has('errorService')).toBe(false);
    
    consoleSpy.mockRestore();
  });
});
