/**
 * Base connector interface for legal system integrations
 */
export interface LegalSystemConnector {
    id: string;
    name: string;
    description: string;
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    searchCases(query: LegalQuery): Promise<CaseLawResult>;
    fetchDocument(documentId: string): Promise<LegalDocument>;
}
/**
 * Query parameters for legal database searches
 */
export interface LegalQuery {
    keywords: string[];
    jurisdiction?: string;
    court?: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    caseType?: string;
    citation?: string;
    judge?: string;
    parties?: string[];
    advanced?: Record<string, any>;
}
/**
 * Result structure for case law searches
 */
export interface CaseLawResult {
    provider: string;
    totalResults: number;
    cases: CaseLawItem[];
    pagination: {
        page: number;
        pageSize: number;
        totalPages: number;
    };
    facets?: Record<string, any>;
}
/**
 * Combined results from multiple providers
 */
export interface CaseLawResults {
    providers: string[];
    totalResults: number;
    cases: CaseLawItem[];
    providerBreakdown: Record<string, number>;
}
/**
 * Individual case law item
 */
export interface CaseLawItem {
    id: string;
    title: string;
    citation: string;
    court: string;
    date: Date;
    parties: string[];
    judges: string[];
    summary: string;
    url?: string;
    source: LegalSource;
    relevanceScore?: number;
}
/**
 * Legal document structure
 */
export interface LegalDocument {
    id: string;
    title: string;
    content: string;
    metadata: Record<string, any>;
    type: LegalDocumentType;
    jurisdiction?: string;
    source: LegalSource;
    retrieved: Date;
}
/**
 * Filing requirements interface
 */
export interface FilingRequirements {
    jurisdiction: Jurisdiction;
    filingType: FilingType;
    requiredFields: string[];
    documentFormat: string[];
    fees: {
        amount: number;
        currency: string;
    };
    deadlines?: {
        filing: Date;
        response?: Date;
    };
    rules: string[];
}
/**
 * Receipt for document filing
 */
export interface FilingReceipt {
    id: string;
    filingId: string;
    jurisdiction: Jurisdiction;
    filingType: FilingType;
    timestamp: Date;
    status: FilingStatus;
    fees: {
        amount: number;
        currency: string;
        receipt: string;
    };
    confirmationNumber?: string;
    documents: {
        id: string;
        name: string;
        hash: string;
    }[];
}
/**
 * Client data structure for enterprise integrations
 */
export interface ClientData {
    id: string;
    name: string;
    contacts: {
        name: string;
        email: string;
        phone: string;
        role: string;
    }[];
    billing: {
        address: string;
        method: string;
        terms: string;
    };
    matters: {
        id: string;
        title: string;
        status: string;
    }[];
    documents: {
        id: string;
        title: string;
        type: string;
    }[];
    metadata: Record<string, any>;
}
/**
 * Smart contract structure for blockchain deployments
 */
export interface LegalSmartContract {
    id: string;
    name: string;
    type: ContractType;
    source: string;
    bytecode?: string;
    abi?: any[];
    parties: {
        id: string;
        role: string;
        address?: string;
    }[];
    parameters: Record<string, any>;
    clauses: {
        id: string;
        title: string;
        content: string;
        condition?: string;
    }[];
}
/**
 * Deployment result for smart contracts
 */
export interface DeploymentResult {
    contractId: string;
    network: BlockchainNetwork;
    address: string;
    transactionHash: string;
    blockNumber: number;
    timestamp: Date;
    constructor: {
        arguments: any[];
        value?: string;
    };
    gas: {
        used: number;
        price: string;
        cost: string;
    };
    status: DeploymentStatus;
}
/**
 * Blockchain proof structure for document verification
 */
export interface BlockchainProof {
    documentId: string;
    hash: string;
    proofs: {
        network: BlockchainNetwork;
        transactionHash: string;
        blockNumber: number;
        timestamp: number;
    }[];
    timestamp: number;
}
/**
 * Collaboration session interface
 */
export interface CollaborationSession {
    sessionId: string;
    participants: Participant[];
    join: () => void;
    leave: () => void;
    status: SessionStatus;
    startTime: Date;
    endTime?: Date;
}
/**
 * Participant in a collaboration session
 */
export interface Participant {
    id: string;
    name: string;
    role: ParticipantRole;
    permissions: Permission[];
    status: ParticipantStatus;
    metadata?: Record<string, any>;
}
/**
 * Secure communication channel
 */
export interface SecureChannel {
    id: string;
    participants: string[];
    onMessage: (encrypted: string) => Promise<string>;
    onSend: (message: string) => Promise<void>;
    isActive: boolean;
}
/**
 * Professional credentials for decentralized identity
 */
export interface ProfessionalCredentials {
    did: string;
    name: string;
    barAdmissions: {
        jurisdiction: string;
        status: string;
        admissionDate: Date;
        barNumber: string;
    }[];
    specializations: string[];
    verificationDate: Date;
}
/**
 * Enum for legal document types
 */
export declare enum LegalDocumentType {
    CASE = "case",
    STATUTE = "statute",
    REGULATION = "regulation",
    CONTRACT = "contract",
    BRIEF = "brief",
    OPINION = "opinion",
    FILING = "filing",
    OTHER = "other"
}
/**
 * Enum for legal sources
 */
export declare enum LegalSource {
    WESTLAW = "westlaw",
    LEXISNEXIS = "lexisnexis",
    PACER = "pacer",
    COURTHOUSENEWS = "courthousenews",
    EDGAR = "edgar",
    USPTO = "uspto",
    CUSTOM = "custom"
}
/**
 * Enum for filing jurisdictions
 */
export declare enum Jurisdiction {
    FEDERAL = "federal",
    STATE = "state",
    LOCAL = "local",
    INTERNATIONAL = "international"
}
/**
 * Enum for filing types
 */
export declare enum FilingType {
    COMPLAINT = "complaint",
    MOTION = "motion",
    BRIEF = "brief",
    RESPONSE = "response",
    APPEAL = "appeal",
    REGISTRATION = "registration",
    APPLICATION = "application",
    OTHER = "other"
}
/**
 * Enum for filing status
 */
export declare enum FilingStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    COMPLETED = "completed"
}
/**
 * Enum for enterprise systems
 */
export declare enum EnterpriseSystem {
    SALESFORCE = "salesforce",
    DYNAMICS = "dynamics",
    SAP = "sap",
    ORACLE = "oracle"
}
/**
 * Enum for blockchain networks
 */
export declare enum BlockchainNetwork {
    ETHEREUM = "ethereum",
    POLYGON = "polygon",
    ARBITRUM = "arbitrum",
    SOLANA = "solana",
    OPTIMISM = "optimism"
}
/**
 * Enum for contract types
 */
export declare enum ContractType {
    NDA = "nda",
    SLA = "sla",
    EMPLOYMENT = "employment",
    LICENSING = "licensing",
    SALE = "sale",
    PARTNERSHIP = "partnership",
    CUSTOM = "custom"
}
/**
 * Enum for deployment status
 */
export declare enum DeploymentStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    FAILED = "failed",
    REVERTED = "reverted"
}
/**
 * Enum for session status
 */
export declare enum SessionStatus {
    ACTIVE = "active",
    PAUSED = "paused",
    ENDED = "ended"
}
/**
 * Enum for participant roles
 */
export declare enum ParticipantRole {
    AUTHOR = "author",
    REVIEWER = "reviewer",
    APPROVER = "approver",
    OBSERVER = "observer"
}
/**
 * Enum for participant status
 */
export declare enum ParticipantStatus {
    ONLINE = "online",
    AWAY = "away",
    OFFLINE = "offline"
}
/**
 * Enum for permissions
 */
export declare enum Permission {
    READ = "read",
    WRITE = "write",
    COMMENT = "comment",
    SUGGEST = "suggest",
    APPROVE = "approve"
}
/**
 * Cache interface
 */
export interface DistributedCache {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: {
        ttl?: number;
    }): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
}
/**
 * Rate limiter interface
 */
export interface RateLimiter {
    execute<T>(fn: () => Promise<T>): Promise<T>;
    limit(key: string, limit: number, duration: number): Promise<boolean>;
}
