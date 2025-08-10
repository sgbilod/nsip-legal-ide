/**
 * Courthouse News Connector
 * Provides integration with Courthouse News Service
 */
import { LegalSystemConnector, LegalQuery, CaseLawResult, LegalDocument } from '../interfaces';
export declare class CourthouseNewsConnector implements LegalSystemConnector {
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
