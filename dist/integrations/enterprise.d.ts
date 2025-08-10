/**
 * Enterprise System Integration
 * Connects NSIP Legal IDE with enterprise CRM and ERP systems
 */
import { IService } from '../core/serviceRegistry';
import { ClientData, EnterpriseSystem } from './interfaces';
/**
 * Enterprise Integration class
 * Manages bidirectional sync with enterprise systems
 */
export declare class EnterpriseIntegration implements IService {
    private logger;
    private eventBus;
    private connectors;
    constructor();
    /**
     * Initialize the enterprise integration
     */
    initialize(): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): Promise<void>;
    /**
     * Synchronize client data between enterprise system and NSIP
     * @param clientId Client identifier
     * @param system Enterprise system to sync with
     * @returns Synchronized client data
     */
    syncClientData(clientId: string, system: EnterpriseSystem): Promise<ClientData>;
    /**
     * Fetch legal data from NSIP
     * @param clientId Client identifier
     * @returns Legal client data
     */
    private fetchLegalData;
    /**
     * Merge data from enterprise and legal systems
     * @param enterpriseData Data from enterprise system
     * @param legalData Data from legal system
     * @returns Merged data
     */
    private mergeData;
    /**
     * Update legal records with merged data
     * @param clientId Client identifier
     * @param data Merged client data
     */
    private updateLegalRecords;
}
