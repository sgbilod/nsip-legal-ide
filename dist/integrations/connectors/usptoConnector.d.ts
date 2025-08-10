/**
 * USPTO Connector
 * Provides integration with USPTO (United States Patent and Trademark Office)
 */
import { LegalSystemConnector, LegalQuery, CaseLawResult, LegalDocument } from '../interfaces';
export declare class USPTOConnector implements LegalSystemConnector {
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
