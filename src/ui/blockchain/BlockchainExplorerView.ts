/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { SmartContractManager } from '../../blockchain/smartContractManager';
import { ContractTemplateManager } from '../../blockchain/contractTemplateManager';

export class BlockchainExplorerView {
    private readonly _view: vscode.WebviewPanel;
    private _smartContractManager: SmartContractManager;
    private _templateManager: ContractTemplateManager;

    constructor(
        extensionUri: vscode.Uri,
        smartContractManager: SmartContractManager,
        templateManager: ContractTemplateManager
    ) {
        this._smartContractManager = smartContractManager;
        this._templateManager = templateManager;

        this._view = vscode.window.createWebviewPanel(
            'blockchainExplorer',
            'Blockchain Explorer',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        this._view.webview.html = this._getWebviewContent();
        this._view.webview.onDidReceiveMessage(this._handleMessage.bind(this));
    }

    private _getWebviewContent(): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <title>Blockchain Explorer</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .contract-list { margin: 20px 0; }
                .contract-item { 
                    padding: 10px;
                    border: 1px solid #ccc;
                    margin: 5px 0;
                    border-radius: 4px;
                }
                .network-status {
                    padding: 10px;
                    background: #f0f0f0;
                    margin-bottom: 20px;
                }
                .button {
                    background: #007acc;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="network-status">
                <h3>Network Status</h3>
                <div id="network-info"></div>
            </div>
            <div class="contract-list">
                <h3>Deployed Contracts</h3>
                <div id="contract-list"></div>
            </div>
            <button class="button" onclick="deployContract()">Deploy New Contract</button>
            <script>
                const vscode = acquireVsCodeApi();
                
                function deployContract() {
                    vscode.postMessage({ command: 'deployContract' });
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    switch (message.type) {
                        case 'updateContracts':
                            updateContractList(message.contracts);
                            break;
                        case 'updateNetwork':
                            updateNetworkStatus(message.network);
                            break;
                    }
                });

                function updateContractList(contracts) {
                    const list = document.getElementById('contract-list');
                    list.innerHTML = contracts.map(contract => `
                        <div class="contract-item">
                            <h4>${contract.name}</h4>
                            <p>Address: ${contract.address}</p>
                            <p>Status: ${contract.status}</p>
                        </div>
                    `).join('');
                }

                function updateNetworkStatus(network) {
                    const info = document.getElementById('network-info');
                    info.innerHTML = `
                        <p>Network: ${network.name}</p>
                        <p>Connected: ${network.connected ? 'Yes' : 'No'}</p>
                        <p>Latest Block: ${network.latestBlock}</p>
                    `;
                }
            </script>
        </body>
        </html>`;
    }

    private async _handleMessage(message: any) {
        switch (message.command) {
            case 'deployContract':
                await this._deployNewContract();
                break;
        }
    }

    private async _deployNewContract() {
        const templates = await this._templateManager.getTemplates();
        const selected = await vscode.window.showQuickPick(
            templates.map(t => ({ label: t.name, template: t }))
        );

        if (selected) {
            try {
                await this._smartContractManager.deployContract(selected.template);
                vscode.window.showInformationMessage('Contract deployed successfully');
            } catch (error) {
                vscode.window.showErrorMessage('Failed to deploy contract: ' + error.message);
            }
        }
    }

    public updateContractList(contracts: any[]) {
        this._view.webview.postMessage({
            type: 'updateContracts',
            contracts
        });
    }

    public updateNetworkStatus(network: any) {
        this._view.webview.postMessage({
            type: 'updateNetwork',
            network
        });
    }
}
