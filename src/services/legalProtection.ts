import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { IService } from '../core/serviceRegistry';
import { ServiceRegistry } from '../core/serviceRegistry';
import { Logger } from '../core/logger';

/**
 * Legal Protection Service - Provides legal protection and security features
 */
export class LegalProtectionService implements IService {
    private logger: Logger;
    private ipAssets: Map<string, IPAsset> = new Map();
    
    /**
     * Initialize the legal protection service
     */
    async initialize(): Promise<void> {
        this.logger = ServiceRegistry.getInstance().get<Logger>('logger');
        
        // Load IP assets from storage
        await this.loadIPAssets();
        
        this.logger.info('Legal protection service initialized');
    }
    
    /**
     * Load IP assets from extension storage
     */
    private async loadIPAssets(): Promise<void> {
        try {
            const context = await this.getExtensionContext();
            const storedAssets = context.globalState.get<IPAsset[]>('ipAssets', []);
            
            for (const asset of storedAssets) {
                this.ipAssets.set(asset.id, asset);
            }
            
            this.logger.info(`Loaded ${this.ipAssets.size} IP assets`);
        } catch (error) {
            this.logger.error('Failed to load IP assets', error);
        }
    }
    
    /**
     * Save IP assets to extension storage
     */
    private async saveIPAssets(): Promise<void> {
        try {
            const context = await this.getExtensionContext();
            const assets = Array.from(this.ipAssets.values());
            await context.globalState.update('ipAssets', assets);
            
            this.logger.info(`Saved ${assets.length} IP assets`);
        } catch (error) {
            this.logger.error('Failed to save IP assets', error);
        }
    }
    
    /**
     * Get extension context
     */
    private async getExtensionContext(): Promise<vscode.ExtensionContext> {
        // In a real implementation, this would be passed to the constructor
        // For this example, we'll use a placeholder
        throw new Error('Extension context not available');
    }
    
    /**
     * Encrypt a document
     * @param content Document content
     * @param password Encryption password
     * @returns Encrypted document
     */
    async encryptDocument(content: string, password: string): Promise<EncryptedDocument> {
        this.logger.info('Encrypting document');
        
        try {
            // Generate salt and initialization vector
            const salt = crypto.randomBytes(16);
            const iv = crypto.randomBytes(16);
            
            // Derive key using PBKDF2
            const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
            
            // Create cipher
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
            
            // Encrypt document
            let encrypted = cipher.update(content, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            
            // Get authentication tag
            const authTag = cipher.getAuthTag();
            
            return {
                content: encrypted,
                salt: salt.toString('base64'),
                iv: iv.toString('base64'),
                authTag: authTag.toString('base64'),
                algorithm: 'aes-256-gcm'
            };
        } catch (error) {
            this.logger.error('Failed to encrypt document', error);
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }
    
    /**
     * Decrypt a document
     * @param encryptedDoc Encrypted document
     * @param password Decryption password
     * @returns Decrypted document content
     */
    async decryptDocument(encryptedDoc: EncryptedDocument, password: string): Promise<string> {
        this.logger.info('Decrypting document');
        
        try {
            // Decode salt and IV
            const salt = Buffer.from(encryptedDoc.salt, 'base64');
            const iv = Buffer.from(encryptedDoc.iv, 'base64');
            const authTag = Buffer.from(encryptedDoc.authTag, 'base64');
            
            // Derive key using PBKDF2
            const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
            
            // Create decipher
            const decipher = crypto.createDecipheriv(encryptedDoc.algorithm, key, iv);
            decipher.setAuthTag(authTag);
            
            // Decrypt document
            let decrypted = decipher.update(encryptedDoc.content, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            this.logger.error('Failed to decrypt document', error);
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
    
    /**
     * Create a digital signature for a document
     * @param content Document content
     * @param privateKey Private key in PEM format
     * @returns Digital signature
     */
    createDigitalSignature(content: string, privateKey: string): string {
        this.logger.info('Creating digital signature');
        
        try {
            const sign = crypto.createSign('SHA256');
            sign.update(content);
            sign.end();
            
            const signature = sign.sign(privateKey, 'base64');
            return signature;
        } catch (error) {
            this.logger.error('Failed to create digital signature', error);
            throw new Error(`Signature creation failed: ${error.message}`);
        }
    }
    
    /**
     * Verify a digital signature
     * @param content Document content
     * @param signature Digital signature
     * @param publicKey Public key in PEM format
     * @returns True if signature is valid
     */
    verifyDigitalSignature(content: string, signature: string, publicKey: string): boolean {
        this.logger.info('Verifying digital signature');
        
        try {
            const verify = crypto.createVerify('SHA256');
            verify.update(content);
            verify.end();
            
            return verify.verify(publicKey, signature, 'base64');
        } catch (error) {
            this.logger.error('Failed to verify digital signature', error);
            throw new Error(`Signature verification failed: ${error.message}`);
        }
    }
    
    /**
     * Create a document hash
     * @param content Document content
     * @returns Document hash
     */
    createDocumentHash(content: string): string {
        this.logger.info('Creating document hash');
        
        try {
            const hash = crypto.createHash('sha256');
            hash.update(content);
            return hash.digest('hex');
        } catch (error) {
            this.logger.error('Failed to create document hash', error);
            throw new Error(`Hash creation failed: ${error.message}`);
        }
    }
    
    /**
     * Verify a document hash
     * @param content Document content
     * @param hash Document hash
     * @returns True if hash is valid
     */
    verifyDocumentHash(content: string, hash: string): boolean {
        this.logger.info('Verifying document hash');
        
        try {
            const calculatedHash = this.createDocumentHash(content);
            return calculatedHash === hash;
        } catch (error) {
            this.logger.error('Failed to verify document hash', error);
            throw new Error(`Hash verification failed: ${error.message}`);
        }
    }
    
    /**
     * Track an IP asset
     * @param type IP asset type
     * @param options IP asset options
     * @returns IP asset
     */
    async trackIPAsset(
        type: IPAssetType,
        options: Partial<IPAssetOptions> = {}
    ): Promise<IPAsset> {
        this.logger.info(`Tracking IP asset of type: ${type}`);
        
        try {
            // Generate ID
            const id = crypto.randomUUID();
            
            // Create IP asset
            const asset: IPAsset = {
                id,
                type,
                name: options.name || `Untitled ${type}`,
                description: options.description || '',
                status: options.status || 'draft',
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                expiryDate: options.expiryDate,
                jurisdiction: options.jurisdiction || ['US'],
                tags: options.tags || [],
                documents: options.documents || [],
                notes: options.notes || ''
            };
            
            // Add to map
            this.ipAssets.set(id, asset);
            
            // Save to storage
            await this.saveIPAssets();
            
            return asset;
        } catch (error) {
            this.logger.error('Failed to track IP asset', error);
            throw new Error(`IP asset tracking failed: ${error.message}`);
        }
    }
    
    /**
     * Get all IP assets
     * @returns Array of IP assets
     */
    getAllIPAssets(): IPAsset[] {
        return Array.from(this.ipAssets.values());
    }
    
    /**
     * Get IP asset by ID
     * @param id IP asset ID
     * @returns IP asset
     */
    getIPAsset(id: string): IPAsset | undefined {
        return this.ipAssets.get(id);
    }
    
    /**
     * Update an IP asset
     * @param id IP asset ID
     * @param updates IP asset updates
     * @returns Updated IP asset
     */
    async updateIPAsset(id: string, updates: Partial<IPAsset>): Promise<IPAsset> {
        this.logger.info(`Updating IP asset: ${id}`);
        
        try {
            const asset = this.ipAssets.get(id);
            
            if (!asset) {
                throw new Error(`IP asset not found: ${id}`);
            }
            
            // Update asset
            const updatedAsset = {
                ...asset,
                ...updates,
                updated: new Date().toISOString()
            };
            
            // Update map
            this.ipAssets.set(id, updatedAsset);
            
            // Save to storage
            await this.saveIPAssets();
            
            return updatedAsset;
        } catch (error) {
            this.logger.error(`Failed to update IP asset: ${id}`, error);
            throw new Error(`IP asset update failed: ${error.message}`);
        }
    }
    
    /**
     * Delete an IP asset
     * @param id IP asset ID
     * @returns True if asset was deleted
     */
    async deleteIPAsset(id: string): Promise<boolean> {
        this.logger.info(`Deleting IP asset: ${id}`);
        
        try {
            const deleted = this.ipAssets.delete(id);
            
            if (deleted) {
                // Save to storage
                await this.saveIPAssets();
            }
            
            return deleted;
        } catch (error) {
            this.logger.error(`Failed to delete IP asset: ${id}`, error);
            throw new Error(`IP asset deletion failed: ${error.message}`);
        }
    }
    
    /**
     * Dispose the legal protection service
     */
    dispose(): void {
        // No resources to dispose
    }
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
