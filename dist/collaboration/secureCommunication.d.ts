/**
 * Secure Communication Channels
 * Implements end-to-end encrypted communication for legal teams
 */
import { IService } from '../core/serviceRegistry';
import { SecureChannel } from '../integrations/interfaces';
/**
 * Secure Communication class
 * Provides end-to-end encrypted channels for legal teams
 */
export declare class SecureCommunication implements IService {
    private logger;
    private eventBus;
    private encryption;
    private signaling;
    private channels;
    constructor();
    /**
     * Initialize the secure communication service
     */
    initialize(): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): Promise<void>;
    /**
     * Establish a secure communication channel
     * @param participants Participant identifiers
     * @returns Secure channel
     */
    establishSecureChannel(participants: string[]): Promise<SecureChannel>;
    /**
     * Send a message through a secure channel
     * @param channelId Channel identifier
     * @param message Message to send
     */
    sendMessage(channelId: string, message: string): Promise<void>;
    /**
     * Close a secure channel
     * @param channelId Channel identifier
     */
    closeChannel(channelId: string): Promise<void>;
    /**
     * Perform key exchange with participants
     * @param participants Participant identifiers
     * @param sessionKey Session key
     */
    private performKeyExchange;
    /**
     * Broadcast a message to all participants
     * @param encrypted Encrypted message
     * @param participants Participant identifiers
     */
    private broadcast;
    /**
     * Handle key exchange offer
     * @param senderId Sender identifier
     * @param offer Key exchange offer
     */
    private handleOffer;
    /**
     * Handle key exchange answer
     * @param senderId Sender identifier
     * @param answer Key exchange answer
     */
    private handleAnswer;
}
