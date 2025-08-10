/**
 * Real-Time Collaboration Engine
 * Implements CRDT-based collaboration for legal document editing
 */
import { IService } from '../core/serviceRegistry';
import { CollaborationSession, Participant } from '../integrations/interfaces';
/**
 * Real-Time Collaboration Engine class
 * Provides synchronized document editing capabilities
 */
export declare class RealTimeCollaboration implements IService {
    private logger;
    private eventBus;
    private auditLog;
    private sessions;
    constructor();
    /**
     * Initialize the collaboration engine
     */
    initialize(): Promise<void>;
    /**
     * Dispose of resources
     */
    dispose(): Promise<void>;
    /**
     * Create a new collaborative editing session
     * @param documentId The document identifier
     * @param participants Initial participants
     * @returns The created collaboration session
     */
    createCollaborativeSession(documentId: string, participants: Participant[]): Promise<CollaborationSession>;
    /**
     * Join an existing collaborative session
     * @param sessionId The session identifier
     * @param participant The participant joining
     */
    joinSession(sessionId: string, participant: Participant): Promise<void>;
    /**
     * Leave a collaborative session
     * @param sessionId The session identifier
     * @param participantId The participant leaving
     */
    leaveSession(sessionId: string, participantId: string): Promise<void>;
    /**
     * Generate a secure session key
     * @returns Session key
     */
    private generateSessionKey;
    /**
     * Generate a consistent color for a user
     * @param userId User identifier
     * @returns Hex color code
     */
    private generateUserColor;
    /**
     * Handle awareness protocol changes
     * @param sessionId Session identifier
     * @param awareness Awareness protocol
     * @param changes Awareness changes
     */
    private handleAwarenessChange;
}
