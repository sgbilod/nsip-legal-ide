/**
 * Integration Layer
 * Provides a unified interface for connecting to external systems
 */

// Core integrations
import { LegalApiGateway } from './legalApiGateway';
import { GovernmentFilingIntegration } from './governmentFiling';
import { EnterpriseIntegration } from './enterprise';

// Blockchain integrations
import { MultiChainPlatform } from '../blockchain/multiChainPlatform';
import { DecentralizedIdentityService } from '../blockchain/decentralizedIdentity';

// Collaboration integrations
import { RealTimeCollaboration } from '../collaboration/realTimeEngine';
import { SecureCommunication } from '../collaboration/secureCommunication';

// Interfaces
export * from './interfaces';

// Export all integration components
export {
    LegalApiGateway,
    GovernmentFilingIntegration,
    EnterpriseIntegration,
    MultiChainPlatform,
    DecentralizedIdentityService,
    RealTimeCollaboration,
    SecureCommunication
};

/**
 * Initialize all integration services
 * @param serviceRegistry Service registry instance
 */
export async function initializeIntegrations(serviceRegistry: any): Promise<void> {
    // Create instances
    const legalApi = new LegalApiGateway();
    const governmentFiling = new GovernmentFilingIntegration();
    const enterprise = new EnterpriseIntegration();
    const blockchain = new MultiChainPlatform();
    const identity = new DecentralizedIdentityService();
    const collaboration = new RealTimeCollaboration();
    const communication = new SecureCommunication();
    
    // Register services
    serviceRegistry.register('legalApi', legalApi);
    serviceRegistry.register('governmentFiling', governmentFiling);
    serviceRegistry.register('enterprise', enterprise);
    serviceRegistry.register('blockchain', blockchain);
    serviceRegistry.register('identity', identity);
    serviceRegistry.register('collaboration', collaboration);
    serviceRegistry.register('communication', communication);
    
    // Initialize services
    await legalApi.initialize();
    await governmentFiling.initialize();
    await enterprise.initialize();
    await blockchain.initialize();
    await identity.initialize();
    await collaboration.initialize();
    await communication.initialize();
}
