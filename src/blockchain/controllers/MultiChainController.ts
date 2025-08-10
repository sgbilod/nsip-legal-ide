/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { MultiChainService } from '../services/MultiChainService';
import { ChainConfig } from '../models/ChainConfig';

export class MultiChainController {
    private multiChainService: MultiChainService;

    constructor(context: vscode.ExtensionContext) {
        this.multiChainService = new MultiChainService();
        this.registerCommands(context);
    }

    private registerCommands(context: vscode.ExtensionContext): void {
        context.subscriptions.push(
            vscode.commands.registerCommand('nsip.addChain', async () => {
                try {
                    const config = await this.promptChainConfig();
                    if (config) {
                        await this.multiChainService.addChain(config);
                        vscode.window.showInformationMessage(`Successfully added chain: ${config.name}`);
                    }
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to add chain');
                }
            }),

            vscode.commands.registerCommand('nsip.switchChain', async () => {
                try {
                    const chainId = await this.promptChainSelection();
                    if (chainId) {
                        const provider = await this.multiChainService.getProvider(chainId);
                        const network = await provider.getNetwork();
                        vscode.window.showInformationMessage(`Switched to network: ${network.name}`);
                    }
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to switch chain');
                }
            })
        );
    }

    private async promptChainConfig(): Promise<ChainConfig | undefined> {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter chain name',
            placeHolder: 'e.g., Optimism'
        });

        if (!name) return undefined;

        const chainId = await vscode.window.showInputBox({
            prompt: 'Enter chain ID',
            placeHolder: 'e.g., 10'
        });

        if (!chainId) return undefined;

        const rpcUrl = await vscode.window.showInputBox({
            prompt: 'Enter RPC URL',
            placeHolder: 'e.g., https://mainnet.optimism.io'
        });

        if (!rpcUrl) return undefined;

        const blockExplorer = await vscode.window.showInputBox({
            prompt: 'Enter block explorer URL',
            placeHolder: 'e.g., https://optimistic.etherscan.io'
        });

        if (!blockExplorer) return undefined;

        return {
            name,
            chainId: parseInt(chainId),
            rpcUrl,
            blockExplorer,
            contracts: {},
            options: {}
        };
    }

    private async promptChainSelection(): Promise<number | undefined> {
        // TODO: Implement chain selection from available chains
        return undefined;
    }
}
