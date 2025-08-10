/**
 * Extensions for the MultiChainPlatform class
 * Using an adapter pattern to extend functionality
 */

import { 
    BlockchainNetwork, 
    DeploymentResult
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

// Add the extension methods to the MultiChainPlatform class
declare module './multiChainPlatform' {
    interface MultiChainPlatform {
        /**
         * Compiles a smart contract and returns the bytecode and ABI
         * @param source The Solidity source code
         * @returns Compilation result with bytecode and ABI
         */
        compileContract(source: string): Promise<CompilationResult>;
        
        /**
         * Deploys a compiled contract to a blockchain
         * @param bytecode The compiled bytecode
         * @param abi The contract ABI
         * @param args Constructor arguments
         * @param network Target blockchain network
         * @returns Deployment result
         */
        deployContract(
            bytecode: string,
            abi: any[],
            args: any[],
            network: BlockchainNetwork
        ): Promise<DeploymentResult>;
        
        /**
         * Executes a method on a deployed contract
         * @param address Contract address
         * @param abi Contract ABI
         * @param method Method name to call
         * @param args Method arguments
         * @param network Blockchain network
         * @returns Method execution result
         */
        executeContractMethod(
            address: string,
            abi: any[],
            method: string,
            args: any[],
            network: BlockchainNetwork
        ): Promise<any>;
    }
}

// Implement the extension methods
MultiChainPlatform.prototype.compileContract = async function(
    source: string
): Promise<CompilationResult> {
    this.logger.info('MultiChainPlatform: Compiling contract');
    
    try {
        // This is a mock implementation since actual Solidity compilation
        // would require solc or a similar compiler
        
        // In a real implementation, this would use solc or a similar compiler
        // For now, we return a mock result
        
        // Parse the contract to extract functions and generate a mock ABI
        const mockAbi = generateMockAbi(source);
        
        const result: CompilationResult = {
            bytecode: '0x608060405234801561001057600080fd5b50610...',
            abi: mockAbi,
            warnings: []
        };
        
        this.logger.info('MultiChainPlatform: Compilation successful');
        
        return result;
    } catch (error) {
        this.logger.error('MultiChainPlatform: Compilation failed', error);
        throw new Error(`Contract compilation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};

MultiChainPlatform.prototype.deployContract = async function(
    bytecode: string,
    abi: any[],
    args: any[],
    network: BlockchainNetwork
): Promise<DeploymentResult> {
    this.logger.info('MultiChainPlatform: Deploying contract', { network });
    
    const connector = this.chains[network];
    
    if (!connector) {
        throw new Error(`No connector available for chain ${network}`);
    }
    
    if (!connector.isConnected()) {
        await connector.connect();
    }
    
    try {
        const deployment = await connector.deployContract(bytecode, abi, args);
        
        this.logger.info('MultiChainPlatform: Contract deployed successfully', {
            address: deployment.address,
            network: deployment.network
        });
        
        return deployment;
    } catch (error) {
        this.logger.error('MultiChainPlatform: Contract deployment failed', error);
        throw new Error(`Contract deployment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};

MultiChainPlatform.prototype.executeContractMethod = async function(
    address: string,
    abi: any[],
    method: string,
    args: any[],
    network: BlockchainNetwork
): Promise<any> {
    this.logger.info('MultiChainPlatform: Executing contract method', { 
        address, 
        method,
        network
    });
    
    const connector = this.chains[network];
    
    if (!connector) {
        throw new Error(`No connector available for chain ${network}`);
    }
    
    if (!connector.isConnected()) {
        await connector.connect();
    }
    
    try {
        const result = await connector.callContract(address, abi, method, args);
        
        this.logger.info('MultiChainPlatform: Contract method executed successfully', {
            address,
            method
        });
        
        return result;
    } catch (error) {
        this.logger.error('MultiChainPlatform: Contract method execution failed', error);
        throw new Error(`Contract method execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * Generate a mock ABI from contract source code
 * This is a very simplified implementation for demonstration purposes
 */
function generateMockAbi(source: string): any[] {
    const abi: any[] = [];
    
    // Extract function definitions using regex
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)(?:\s+(?:public|external|view|pure))?\s*(?:returns\s*\(([^)]*)\))?\s*{/g;
    let match;
    
    while ((match = functionRegex.exec(source)) !== null) {
        const name = match[1];
        const inputs = match[2];
        const outputs = match[3] || '';
        
        const abiItem: any = {
            name,
            type: 'function',
            inputs: parseParameters(inputs),
            outputs: parseParameters(outputs),
            stateMutability: source.includes(`function ${name}`) && source.includes('view') 
                ? 'view' 
                : 'nonpayable'
        };
        
        abi.push(abiItem);
    }
    
    // Add constructor
    const constructorRegex = /constructor\s*\(([^)]*)\)/;
    const constructorMatch = constructorRegex.exec(source);
    
    if (constructorMatch) {
        abi.push({
            type: 'constructor',
            inputs: parseParameters(constructorMatch[1]),
            stateMutability: 'nonpayable'
        });
    }
    
    // Add events
    const eventRegex = /event\s+(\w+)\s*\(([^)]*)\)/g;
    while ((match = eventRegex.exec(source)) !== null) {
        abi.push({
            name: match[1],
            type: 'event',
            inputs: parseParameters(match[2], true),
            anonymous: false
        });
    }
    
    return abi;
}

function parseParameters(params: string, isEvent = false): any[] {
    if (!params.trim()) {
        return [];
    }
    
    return params.split(',').map(param => {
        const parts = param.trim().split(' ');
        const typeMatch = /^(address|uint256|string|bool|bytes32|uint8|bytes)(\[\])?/.exec(parts[0]);
        
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
