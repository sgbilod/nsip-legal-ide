/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { CollaborationService } from '../services/CollaborationService';
import { CollaborationUser } from '../models/CollaborationUser';

export class CollaborationController {
    private collaborationService: CollaborationService;

    constructor(context: vscode.ExtensionContext) {
        this.collaborationService = new CollaborationService(context);
        this.registerCommands(context);
    }

    private registerCommands(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.commands.registerCommand('nsip.startCollaboration', async () => {
                try {
                    await this.collaborationService.initializeCollaboration();
                    const user = await this.promptUserDetails();
                    if (user) {
                        await this.collaborationService.addUser(user);
                        vscode.window.showInformationMessage('Successfully joined collaboration session');
                    }
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to start collaboration');
                }
            })
        );
    }

    private async promptUserDetails(): Promise<CollaborationUser | undefined> {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter your name',
            placeHolder: 'e.g., John Doe'
        });

        if (!name) return undefined;

        const role = await vscode.window.showQuickPick(
            ['owner', 'editor', 'viewer'],
            {
                placeHolder: 'Select your role'
            }
        );

        if (!role) return undefined;

        return {
            id: Date.now().toString(),
            name,
            role: role as 'owner' | 'editor' | 'viewer',
            publicKey: '', // TODO: Generate or get from wallet
            lastActive: new Date(),
            permissions: {
                canEdit: role !== 'viewer',
                canDelete: role === 'owner',
                canShare: role !== 'viewer',
                canInvite: role === 'owner'
            }
        };
    }
}
