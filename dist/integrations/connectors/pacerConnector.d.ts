/**
 * PACER Connector
 * Provides integration with PACER (Public Access to Court Electronic Records)
 */
import { LegalSystemConnector, LegalQuery, CaseLawResult, LegalDocument } from '../interfaces';
export declare class PACERConnector implements LegalSystemConnector {
    id: string;
    name: string;
    description: string;
    private _connected;
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    searchCases(_query: LegalQuery): Promise<CaseLawResult>;
    fetchDocument(_documentId: string): Promise<LegalDocument>;
}
