/**
 * Quantum-Resistant Security
 *
 * This module provides post-quantum cryptography for secure document
 * protection and verification.
 */
import { LegalDocument, QuantumSecureDocument } from '../ml/interfaces';
import { IService } from '../core/interfaces';
import { ServiceRegistry } from '../core/serviceRegistry';
import { EventBus } from '../core/eventBus';
import { Logger } from '../core/logger';
/**
 * Quantum-Resistant Security implementation
 *
 * Provides post-quantum cryptography for secure document
 * protection and verification.
 */
export declare class QuantumResistantSecurity implements IService {
    private kyber;
    private dilithium;
    private logger;
    private eventBus;
    private serviceRegistry;
    private keyStore;
    constructor(logger: Logger, eventBus: EventBus, serviceRegistry: ServiceRegistry);
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Dispose the service resources
     */
    dispose(): Promise<void>;
    /**
     * Secure a document using quantum-resistant cryptography
     *
     * @param document Document to secure
     * @returns Quantum-secure document
     */
    secureDocument(document: LegalDocument): Promise<QuantumSecureDocument>;
    /**
     * Verify a quantum-secure document
     *
     * @param secureDocument Document to verify
     * @returns Verification result
     */
    verifySecureDocument(secureDocument: QuantumSecureDocument): Promise<{
        verified: boolean;
        details: any;
    }>;
    /**
     * Create a blockchain proof for a document
     */
    private createQuantumProof;
    /**
     * Verify a blockchain proof
     */
    private verifyBlockchainProof;
    /**
     * Store a public key
     */
    private storeKey;
    /**
     * Retrieve a public key
     */
    private getKey;
    /**
     * Event handler for document created events
     */
    private handleDocumentCreated;
}
export declare function createQuantumResistantSecurity(logger: Logger, eventBus: EventBus, serviceRegistry: ServiceRegistry): QuantumResistantSecurity;
