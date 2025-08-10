import { IService } from '../core/serviceRegistry';
/**
 * Legal Protection Service - Provides legal protection and security features
 */
export declare class LegalProtectionService implements IService {
    private logger;
    private ipAssets;
    /**
     * Initialize the legal protection service
     */
    initialize(): Promise<void>;
    /**
     * Load IP assets from extension storage
     */
    private loadIPAssets;
    /**
     * Save IP assets to extension storage
     */
    private saveIPAssets;
    /**
     * Get extension context
     */
    private getExtensionContext;
    /**
     * Encrypt a document
     * @param content Document content
     * @param password Encryption password
     * @returns Encrypted document
     */
    encryptDocument(content: string, password: string): Promise<EncryptedDocument>;
    /**
     * Decrypt a document
     * @param encryptedDoc Encrypted document
     * @param password Decryption password
     * @returns Decrypted document content
     */
    decryptDocument(encryptedDoc: EncryptedDocument, password: string): Promise<string>;
    /**
     * Create a digital signature for a document
     * @param content Document content
     * @param privateKey Private key in PEM format
     * @returns Digital signature
     */
    createDigitalSignature(content: string, privateKey: string): string;
    /**
     * Verify a digital signature
     * @param content Document content
     * @param signature Digital signature
     * @param publicKey Public key in PEM format
     * @returns True if signature is valid
     */
    verifyDigitalSignature(content: string, signature: string, publicKey: string): boolean;
    /**
     * Create a document hash
     * @param content Document content
     * @returns Document hash
     */
    createDocumentHash(content: string): string;
    /**
     * Verify a document hash
     * @param content Document content
     * @param hash Document hash
     * @returns True if hash is valid
     */
    verifyDocumentHash(content: string, hash: string): boolean;
    /**
     * Track an IP asset
     * @param type IP asset type
     * @param options IP asset options
     * @returns IP asset
     */
    trackIPAsset(type: IPAssetType, options?: Partial<IPAssetOptions>): Promise<IPAsset>;
    /**
     * Get all IP assets
     * @returns Array of IP assets
     */
    getAllIPAssets(): IPAsset[];
    /**
     * Get IP asset by ID
     * @param id IP asset ID
     * @returns IP asset
     */
    getIPAsset(id: string): IPAsset | undefined;
    /**
     * Update an IP asset
     * @param id IP asset ID
     * @param updates IP asset updates
     * @returns Updated IP asset
     */
    updateIPAsset(id: string, updates: Partial<IPAsset>): Promise<IPAsset>;
    /**
     * Delete an IP asset
     * @param id IP asset ID
     * @returns True if asset was deleted
     */
    deleteIPAsset(id: string): Promise<boolean>;
    /**
     * Dispose the legal protection service
     */
    dispose(): void;
}
/**
 * Encrypted document interface
 */
export interface EncryptedDocument {
    content: string;
    salt: string;
    iv: string;
    authTag: string;
    algorithm: string;
}
/**
 * IP asset type
 */
export type IPAssetType = 'patent' | 'copyright' | 'trademark' | 'trade-secret' | 'industrial-design';
/**
 * IP asset status
 */
export type IPAssetStatus = 'draft' | 'filed' | 'registered' | 'pending' | 'granted' | 'abandoned' | 'expired';
/**
 * IP asset interface
 */
export interface IPAsset {
    id: string;
    type: IPAssetType;
    name: string;
    description: string;
    status: IPAssetStatus;
    created: string;
    updated: string;
    expiryDate?: string;
    jurisdiction: string[];
    tags: string[];
    documents: IPAssetDocument[];
    notes: string;
}
/**
 * IP asset document interface
 */
export interface IPAssetDocument {
    id: string;
    name: string;
    uri: string;
    type: string;
    hash: string;
}
/**
 * IP asset options interface
 */
export interface IPAssetOptions {
    name: string;
    description: string;
    status: IPAssetStatus;
    expiryDate?: string;
    jurisdiction: string[];
    tags: string[];
    documents: IPAssetDocument[];
    notes: string;
}
