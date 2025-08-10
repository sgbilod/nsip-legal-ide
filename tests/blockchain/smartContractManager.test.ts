import { SmartContractManager, SmartContractTemplateType } from '../../src/blockchain/smartContractManager';
import { MultiChainPlatform } from '../../src/blockchain/multiChainPlatform';
import { DecentralizedIdentityService } from '../../src/blockchain/decentralizedIdentity';
import { ContractTemplateManager } from '../../src/blockchain/contractTemplateManager';
import { EventBus } from '../../src/core/eventBus';
import { Logger } from '../../src/core/logger';

// Mock dependencies
jest.mock('vscode');
jest.mock('../../src/blockchain/multiChainPlatform');
jest.mock('../../src/blockchain/decentralizedIdentity');
jest.mock('../../src/core/eventBus');
jest.mock('../../src/core/logger');

describe('SmartContractManager', () => {
    let smartContractManager: SmartContractManager;
    let mockMultiChainPlatform: jest.Mocked<MultiChainPlatform>;
    let mockDecentralizedIdentity: jest.Mocked<DecentralizedIdentityService>;
    let mockLogger: jest.Mocked<Logger>;
    let mockEventBus: jest.Mocked<EventBus>;
    
    beforeEach(() => {
        // Create mocks
        mockMultiChainPlatform = new MultiChainPlatform() as jest.Mocked<MultiChainPlatform>;
        mockDecentralizedIdentity = new DecentralizedIdentityService() as jest.Mocked<DecentralizedIdentityService>;
        mockLogger = {} as jest.Mocked<Logger>;
        mockLogger.info = jest.fn();
        mockLogger.error = jest.fn();
        mockLogger.debug = jest.fn();
        mockLogger.warn = jest.fn();
        
        mockEventBus = {} as jest.Mocked<EventBus>;
        mockEventBus.on = jest.fn();
        mockEventBus.off = jest.fn();
        mockEventBus.emit = jest.fn();
        
        // Create the manager with mocked dependencies
        smartContractManager = new SmartContractManager(
            mockMultiChainPlatform,
            mockDecentralizedIdentity,
            mockLogger,
            mockEventBus
        );
    });
    
    describe('initialization', () => {
        it('should initialize correctly', async () => {
            await smartContractManager.initialize();
            
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Initializing'));
            expect(mockEventBus.on).toHaveBeenCalledTimes(expect.any(Number));
        });
    });
    
    describe('createContractFromTemplate', () => {
        it('should create a contract with valid parameters', async () => {
            // Mock template manager to return a template
            jest.spyOn(smartContractManager as any, 'generateContractSource').mockResolvedValue('contract source');
            
            const result = await smartContractManager.createContractFromTemplate(
                SmartContractTemplateType.AGREEMENT,
                'Test Contract',
                {
                    partyA: 'Alice',
                    partyB: 'Bob',
                    amount: 100,
                    duration: 30
                }
            );
            
            expect(result).toBeDefined();
            expect(result.name).toBe('Test Contract');
            expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('contract.created'));
        });
        
        it('should throw an error when template generation fails', async () => {
            // Mock template generation to fail
            jest.spyOn(smartContractManager as any, 'generateContractSource').mockRejectedValue(new Error('Template error'));
            
            await expect(
                smartContractManager.createContractFromTemplate(
                    SmartContractTemplateType.AGREEMENT,
                    'Test Contract',
                    {}
                )
            ).rejects.toThrow('Template error');
        });
    });
    
    describe('compileContract', () => {
        it('should compile a valid contract', async () => {
            // Create a contract first
            jest.spyOn(smartContractManager as any, 'generateContractSource').mockResolvedValue('contract source');
            const contract = await smartContractManager.createContractFromTemplate(
                SmartContractTemplateType.AGREEMENT,
                'Test Contract',
                {}
            );
            
            // Mock the compilation function
            smartContractManager['chainAdapter'].compileContract = jest.fn().mockResolvedValue({
                bytecode: '0x123456',
                abi: [{ type: 'function', name: 'test' }]
            });
            
            const result = await smartContractManager.compileContract(contract.id);
            
            expect(result).toBeDefined();
            expect(result.bytecode).toBe('0x123456');
            expect(smartContractManager['chainAdapter'].compileContract).toHaveBeenCalled();
        });
        
        it('should throw an error when compilation fails', async () => {
            // Create a contract first
            jest.spyOn(smartContractManager as any, 'generateContractSource').mockResolvedValue('contract source');
            const contract = await smartContractManager.createContractFromTemplate(
                SmartContractTemplateType.AGREEMENT,
                'Test Contract',
                {}
            );
            
            // Mock compilation failure
            smartContractManager['chainAdapter'].compileContract = jest.fn().mockRejectedValue(new Error('Compilation error'));
            
            await expect(
                smartContractManager.compileContract(contract.id)
            ).rejects.toThrow('Compilation error');
        });
    });
    
    // Additional tests would be added for deployContract, executeContract, etc.
});

describe('ContractTemplateManager', () => {
    let templateManager: ContractTemplateManager;
    
    beforeEach(() => {
        templateManager = new ContractTemplateManager();
    });
    
    describe('initialization', () => {
        it('should initialize with built-in templates', async () => {
            await templateManager.initialize();
            
            // Test that we have templates
            const templates = templateManager.getTemplates();
            expect(templates.length).toBeGreaterThan(0);
        });
    });
    
    describe('getTemplatesByType', () => {
        it('should return templates filtered by type', async () => {
            await templateManager.initialize();
            
            const agreementTemplates = templateManager.getTemplatesByType(SmartContractTemplateType.AGREEMENT);
            const escrowTemplates = templateManager.getTemplatesByType(SmartContractTemplateType.ESCROW);
            
            expect(agreementTemplates.length).toBeGreaterThan(0);
            expect(escrowTemplates.length).toBeGreaterThan(0);
            
            // Check that all returned templates have the correct type
            agreementTemplates.forEach(template => {
                expect(template.type).toBe(SmartContractTemplateType.AGREEMENT);
            });
        });
    });
    
    // Additional tests for template operations would be added here
});
