/**
 * MultiChainAdapter - Adapter for MultiChainPlatform
 * Provides extended functionality for blockchain operations
 */

import { 
    BlockchainNetwork, 
    DeploymentResult,
    DeploymentStatus
} from '../integrations/interfaces';
import { MultiChainPlatform } from './multiChainPlatform';
import { ServiceRegistry } from '../core/serviceRegistry';
import { Logger } from '../core/logger';

/**
 * Contract compilation result
 */
export interface CompilationResult {
    bytecode: string;
    abi: any[];
    warnings?: string[];
    errors?: string[];
}

/**
 * MultiChainAdapter - provides additional functionality for the MultiChainPlatform
 * using composition rather than inheritance
 */
export class MultiChainAdapter {
    private platform: MultiChainPlatform;
    private logger: Logger;
    
    constructor(platform: MultiChainPlatform) {
        this.platform = platform;
        
        // Get logger from service registry
        const serviceRegistry = ServiceRegistry.getInstance();
        this.logger = serviceRegistry.get<Logger>('logger');
    }
    
    /**
     * Compiles a smart contract and returns the bytecode and ABI
     * @param source The Solidity source code
     * @returns Compilation result with bytecode and ABI
     */
    async compileContract(source: string): Promise<CompilationResult> {
        this.logger.info('MultiChainAdapter: Compiling contract');
        
        try {
            // This is a mock implementation since actual Solidity compilation
            // would require solc or a similar compiler
            
            // Parse the contract to extract functions and generate a mock ABI
            const mockAbi = this.generateMockAbi(source);
            
            const result: CompilationResult = {
                bytecode: '0x608060405234801561001057600080fd5b50610...',
                abi: mockAbi,
                warnings: []
            };
            
            this.logger.info('MultiChainAdapter: Compilation successful');
            
            return result;
        } catch (error) {
            this.logger.error('MultiChainAdapter: Compilation failed', error);
            throw new Error(`Contract compilation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Deploys a compiled contract to a blockchain
     * @param bytecode The compiled bytecode
     * @param abi The contract ABI
     * @param args Constructor arguments
     * @param network Target blockchain network
     * @returns Deployment result
     */
    async deployContract(
        bytecode: string,
        abi: any[],
        args: any[],
        network: BlockchainNetwork
    ): Promise<DeploymentResult> {
        this.logger.info('MultiChainAdapter: Deploying contract', { network });
        
        try {
            // Since we can't directly access the private chains property,
            // we'll use the platform to deploy the contract
            // This is a simulated result since we can't call the actual implementation
            
            // In a real implementation, we would call the actual deployContract method
            // of the underlying connector
            const deployment: DeploymentResult = {
                contractId: this.generateId(),
                network,
                address: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
                transactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
                blockNumber: Math.floor(Math.random() * 1000000),
                timestamp: new Date(),
                constructor: {
                    arguments: args
                },
                gas: {
                    used: 2000000,
                    price: '20000000000',
                    cost: '0.04'
                },
                status: DeploymentStatus.CONFIRMED
            };
            
            this.logger.info('MultiChainAdapter: Contract deployed successfully', {
                address: deployment.address,
                network: deployment.network
            });
            
            return deployment;
        } catch (error) {
            this.logger.error('MultiChainAdapter: Contract deployment failed', error);
            throw new Error(`Contract deployment failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Executes a method on a deployed contract
     * @param address Contract address
     * @param abi Contract ABI
     * @param method Method name to call
     * @param args Method arguments
     * @param network Blockchain network
     * @returns Method execution result
     */
    async executeContractMethod(
        address: string,
        abi: any[],
        method: string,
        args: any[],
        network: BlockchainNetwork
    ): Promise<any> {
        this.logger.info('MultiChainAdapter: Executing contract method', { 
            address, 
            method,
            network
        });
        
        try {
            // Simulate contract method execution
            const result = {
                success: true,
                data: `Result of ${method}(${args.join(',')})`
            };
            
            this.logger.info('MultiChainAdapter: Contract method executed successfully', {
                address,
                method
            });
            
            return result;
        } catch (error) {
            this.logger.error('MultiChainAdapter: Contract method execution failed', error);
            throw new Error(`Contract method execution failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Generate a mock ABI from contract source code
     * This is a very simplified implementation for demonstration purposes
     */
    private generateMockAbi(source: string): any[] {
        const abi: any[] = [];
        
        // Extract function definitions using regex
        const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)(?:\s+(?:public|external|view|pure))?\s*(?:returns\s*\(([^)]*)\))?\s*{/g;
        let match;
        
        while ((match = functionRegex.exec(source)) !== null) {
            const name = match[1];
            const inputs = match[2] || '';
            const outputs = match[3] || '';
            
            const abiItem: any = {
                name,
                type: 'function',
                inputs: this.parseParameters(inputs),
                outputs: this.parseParameters(outputs),
                stateMutability: source.includes(`function ${name}`) && source.includes('view') 
                    ? 'view' 
                    : 'nonpayable'
            };
            
            abi.push(abiItem);
        }
        
        // Add constructor
        const constructorRegex = /constructor\s*\(([^)]*)\)/;
        const constructorMatch = constructorRegex.exec(source);
        
        if (constructorMatch && constructorMatch[1]) {
            abi.push({
                type: 'constructor',
                inputs: this.parseParameters(constructorMatch[1]),
                stateMutability: 'nonpayable'
            });
        }
        
        // Add events
        const eventRegex = /event\s+(\w+)\s*\(([^)]*)\)/g;
        while ((match = eventRegex.exec(source)) !== null) {
            if (match[2]) {
                abi.push({
                    name: match[1],
                    type: 'event',
                    inputs: this.parseParameters(match[2], true),
                    anonymous: false
                });
            }
        }
        
        return abi;
    }
    
    /**
     * Parse Solidity parameters into ABI format
     */
    private parseParameters(params: string, isEvent = false): any[] {
        if (!params.trim()) {
            return [];
        }
        
        return params.split(',').map(param => {
            const parts = param.trim().split(' ');
            
            if (parts.length === 0 || !parts[0]) {
                return {
                    name: '',
                    type: 'uint256',
                    indexed: isEvent ? false : undefined
                };
            }
            
            const typeMatch = /^(address|uint256|string|bool|bytes32|uint8|bytes)(\[\])?/.exec(parts[0] || '');
            
            if (!typeMatch) {
                // Default to uint256 if type can't be determined
                return {
                    name: parts.length > 1 ? parts[1] : '',
                    type: 'uint256',
                    indexed: isEvent ? false : undefined
                };
            }
            
            return {
                name: parts.length > 1 ? parts[1] : '',
                type: typeMatch[1] + (typeMatch[2] || ''),
                indexed: isEvent && parts.includes('indexed') ? true : (isEvent ? false : undefined)
            };
        });
    }
    
    /**
     * Generate a random ID for contracts
     */
    private generateId(): string {
        return 'contract_' + Date.now() + '_' + 
            Math.random().toString(36).substring(2, 15);
    }
}

// Factory function to create a MultiChainAdapter
export function createMultiChainAdapter(platform: MultiChainPlatform): MultiChainAdapter {
    return new MultiChainAdapter(platform);
}
