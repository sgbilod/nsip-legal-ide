/**
 * Blockchain Module Extension Index
 * 
 * This file re-exports and integrates extensions to the blockchain components.
 */

// Export adapter types and functions
export { 
    CompilationResult, 
    MultiChainAdapter, 
    createMultiChainAdapter 
} from './multiChainAdapter';

// Export utility functions
export function getBytecodeFromSource(source: string): string {
    // In a real implementation, this would compile the source code
    // For now, return a mock bytecode
    return '0x608060405234801561001057600080fd5b50610...';
}

// Export contract creation helpers
export function createContractAbi(name: string, methods: string[]): any[] {
    return methods.map(method => ({
        name: method,
        type: 'function',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable'
    }));
}
