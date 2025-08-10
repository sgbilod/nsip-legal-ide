/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

export interface CollaborationUser {
    id: string;
    name: string;
    role: 'owner' | 'editor' | 'viewer';
    publicKey: string;
    lastActive: Date;
    permissions: {
        canEdit: boolean;
        canDelete: boolean;
        canShare: boolean;
        canInvite: boolean;
    };
}
