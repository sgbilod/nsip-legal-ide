/**
 * Integration Layer
 * Provides a unified interface for connecting to external systems
 */
import { LegalApiGateway } from './legalApiGateway';
import { GovernmentFilingIntegration } from './governmentFiling';
import { EnterpriseIntegration } from './enterprise';
import { MultiChainPlatform } from '../blockchain/multiChainPlatform';
import { DecentralizedIdentityService } from '../blockchain/decentralizedIdentity';
import { RealTimeCollaboration } from '../collaboration/realTimeEngine';
import { SecureCommunication } from '../collaboration/secureCommunication';
export * from './interfaces';
export { LegalApiGateway, GovernmentFilingIntegration, EnterpriseIntegration, MultiChainPlatform, DecentralizedIdentityService, RealTimeCollaboration, SecureCommunication };
/**
 * Initialize all integration services
 * @param serviceRegistry Service registry instance
 */
export declare function initializeIntegrations(serviceRegistry: any): Promise<void>;
