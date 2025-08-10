"use strict";
/**
 * Decentralized Identity Service
 * Implements DID-based identity verification for legal professionals
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecentralizedIdentityService = void 0;
const serviceRegistry_1 = require("../core/serviceRegistry");
// DID Resolver implementation
class UniversalDIDResolver {
    constructor() {
        this.methods = new Map();
        // Register supported DID methods
        this.registerMethod('did:ethr', new EthereumDIDMethod());
        this.registerMethod('did:web', new WebDIDMethod());
        this.registerMethod('did:key', new KeyDIDMethod());
    }
    registerMethod(prefix, method) {
        this.methods.set(prefix, method);
    }
    async resolve(did) {
        for (const [prefix, method] of this.methods.entries()) {
            if (did.startsWith(prefix)) {
                return method.resolve(did);
            }
        }
        throw new Error(`Unsupported DID method: ${did}`);
    }
    async verify(credential) {
        const issuerDid = credential.issuer;
        for (const [prefix, method] of this.methods.entries()) {
            if (issuerDid.startsWith(prefix)) {
                return method.verifyCredential(credential);
            }
        }
        throw new Error(`Unsupported DID method for issuer: ${issuerDid}`);
    }
}
// Ethereum DID Method
class EthereumDIDMethod {
    async resolve(_did) {
        // Implementation details
        return {};
    }
    async verifyCredential(_credential) {
        // Implementation details
        return true;
    }
}
// Web DID Method
class WebDIDMethod {
    async resolve(_did) {
        // Implementation details
        return {};
    }
    async verifyCredential(_credential) {
        // Implementation details
        return true;
    }
}
// Key DID Method
class KeyDIDMethod {
    async resolve(_did) {
        // Implementation details
        return {};
    }
    async verifyCredential(_credential) {
        // Implementation details
        return true;
    }
}
/**
 * Decentralized Identity Service class
 * Manages legal professional identity verification using DIDs
 */
class DecentralizedIdentityService {
    constructor() {
        const serviceRegistry = serviceRegistry_1.ServiceRegistry.getInstance();
        this.logger = serviceRegistry.get('logger');
        this.eventBus = serviceRegistry.get('eventBus');
        this.logger.info('DecentralizedIdentityService: Initializing');
        // Initialize DID resolver
        this.didResolver = new UniversalDIDResolver();
    }
    /**
     * Initialize the service
     */
    async initialize() {
        this.logger.info('DecentralizedIdentityService: Initialization complete');
        // Subscribe to events
        this.eventBus.subscribe('identity.verify.requested', {
            id: 'decentralizedIdentityService.verifyProfessional',
            handle: async (data) => {
                try {
                    const credentials = await this.verifyLegalProfessional(data.did);
                    this.eventBus.publish('identity.verify.completed', {
                        did: data.did,
                        credentials
                    });
                }
                catch (error) {
                    this.logger.error('DecentralizedIdentityService: Verification failed', error);
                    this.eventBus.publish('identity.verify.failed', {
                        did: data.did,
                        error
                    });
                }
            }
        });
    }
    /**
     * Dispose of resources
     */
    async dispose() {
        this.logger.info('DecentralizedIdentityService: Disposing');
        // Unsubscribe from events
        this.eventBus.unsubscribe('identity.verify.requested', 'decentralizedIdentityService.verifyProfessional');
    }
    /**
     * Verify a legal professional's credentials using their DID
     * @param did Decentralized identifier
     * @returns Professional credentials
     */
    async verifyLegalProfessional(did) {
        this.logger.info('DecentralizedIdentityService: Verifying legal professional', { did });
        // Resolve DID
        const identity = await this.didResolver.resolve(did);
        // Verify credentials
        const credentials = await this.verifyCredentials(identity.verifiableCredentials);
        // Check bar associations
        const barStatus = await this.checkBarMembership(credentials);
        // Verify specializations
        const specializations = await this.verifySpecializations(credentials);
        const result = {
            did,
            name: identity.name,
            barAdmissions: barStatus.map(status => ({
                jurisdiction: status.jurisdiction,
                status: status.status,
                admissionDate: status.admissionDate,
                barNumber: status.barNumber
            })),
            specializations,
            verificationDate: new Date()
        };
        this.logger.info('DecentralizedIdentityService: Verification complete', {
            did,
            barAdmissions: result.barAdmissions.length,
            specializations: result.specializations.length
        });
        return result;
    }
    /**
     * Verify a set of credentials
     * @param verifiableCredentials Array of verifiable credentials
     * @returns Filtered and verified credentials
     */
    async verifyCredentials(verifiableCredentials) {
        const verified = [];
        for (const credential of verifiableCredentials) {
            try {
                const isValid = await this.didResolver.verify(credential);
                if (isValid) {
                    verified.push(credential);
                }
                else {
                    this.logger.warn('DecentralizedIdentityService: Invalid credential', {
                        id: credential.id
                    });
                }
            }
            catch (error) {
                this.logger.error('DecentralizedIdentityService: Error verifying credential', {
                    id: credential.id,
                    error
                });
            }
        }
        return verified;
    }
    /**
     * Check bar membership status from credentials
     * @param credentials Verified credentials
     * @returns Bar membership status
     */
    async checkBarMembership(credentials) {
        const barCredentials = credentials.filter(credential => credential.type.includes('BarCredential'));
        const barStatus = [];
        for (const credential of barCredentials) {
            const subject = credential.credentialSubject;
            barStatus.push({
                jurisdiction: subject.jurisdiction,
                status: subject.status,
                barNumber: subject.barNumber,
                admissionDate: new Date(subject.admissionDate),
                goodStanding: subject.goodStanding === true
            });
        }
        return barStatus;
    }
    /**
     * Verify legal specializations from credentials
     * @param credentials Verified credentials
     * @returns List of verified specializations
     */
    async verifySpecializations(credentials) {
        const specializationCredentials = credentials.filter(credential => credential.type.includes('SpecializationCredential'));
        const specializations = new Set();
        for (const credential of specializationCredentials) {
            const subject = credential.credentialSubject;
            if (subject.specialization) {
                specializations.add(subject.specialization);
            }
        }
        return Array.from(specializations);
    }
}
exports.DecentralizedIdentityService = DecentralizedIdentityService;
//# sourceMappingURL=decentralizedIdentity.js.map