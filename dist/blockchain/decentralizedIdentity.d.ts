/**
 * Decentralized Identity Service
 * Implements DID-based identity verification for legal professionals
 */
import { IService } from '../core/serviceRegistry';
import { ProfessionalCredentials } from '../integrations/interfaces';
/**
 * Decentralized Identity Service class
 * Manages legal professional identity verification using DIDs
 */
export declare class DecentralizedIdentityService implements IService {
    private logger;
    private eventBus;
    private didResolver;
    constructor();
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): Promise<void>;
    /**
     * Verify a legal professional's credentials using their DID
     * @param did Decentralized identifier
     * @returns Professional credentials
     */
    verifyLegalProfessional(did: string): Promise<ProfessionalCredentials>;
    /**
     * Verify a set of credentials
     * @param verifiableCredentials Array of verifiable credentials
     * @returns Filtered and verified credentials
     */
    private verifyCredentials;
    /**
     * Check bar membership status from credentials
     * @param credentials Verified credentials
     * @returns Bar membership status
     */
    private checkBarMembership;
    /**
     * Verify legal specializations from credentials
     * @param credentials Verified credentials
     * @returns List of verified specializations
     */
    private verifySpecializations;
}
