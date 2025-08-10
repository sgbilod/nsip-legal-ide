/**
 * Multi-Chain Platform for Smart Contract Integration
 * Provides a unified interface for deploying and interacting with smart contracts
 * across multiple blockchain networks
 */
import { IService } from '../core/serviceRegistry';
import { LegalSmartContract, BlockchainNetwork, DeploymentResult, LegalDocument, BlockchainProof } from '../integrations/interfaces';
/**
 * Multi-Chain Platform class
 * Manages smart contract deployment and interaction across multiple blockchain networks
 */
export declare class MultiChainPlatform implements IService {
    private logger;
    private eventBus;
    private contractRegistry;
    private chains;
    constructor();
    /**
     * Initialize the blockchain platform
     */
    initialize(): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): Promise<void>;
    /**
     * Deploy a legal smart contract to a blockchain network
     * @param contract The legal smart contract to deploy
     * @param chain The blockchain network to deploy to
     * @returns Deployment result
     */
    deployLegalContract(contract: LegalSmartContract, chain: BlockchainNetwork): Promise<DeploymentResult>;
    /**
     * Create a document hash and store it on multiple blockchains
     * @param document The legal document to hash
     * @returns Blockchain proof
     */
    createDocumentHash(document: LegalDocument): Promise<BlockchainProof>;
    /**
     * Compile a smart contract for a specific blockchain
     * @param contract The legal smart contract
     * @param chain The target blockchain network
     * @returns Compiled contract
     */
    private compileForChain;
    /**
     * Estimate the cost of deploying a contract
     * @param compiled The compiled contract
     * @param chain The target blockchain network
     * @returns Estimated deployment cost
     */
    private estimateDeploymentCost;
    /**
     * Deploy a contract with retry logic
     * @param compiled The compiled contract
     * @param chain The target blockchain network
     * @param options Deployment options
     * @returns Deployment result
     */
    private deployWithRetry;
    /**
     * Verify a deployed contract on a block explorer
     * @param deployment The deployment result
     * @param chain The blockchain network
     * @returns Whether verification was successful
     */
    private verifyContract;
    /**
     * Hash a legal document
     * @param document The legal document to hash
     * @returns The document hash
     */
    private hashDocument;
}
