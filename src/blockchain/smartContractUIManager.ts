/**
 * Smart Contract UI Manager
 * Provides UI components for interacting with smart contracts
 */

import * as vscode from 'vscode';
import { IService } from '../core/interfaces';
import { ServiceRegistry } from '../core/serviceRegistry';
import { Logger } from '../core/logger';
import { EventBus } from '../core/eventBus';
import { SmartContractManager, SmartContract, SmartContractTemplateType } from './smartContractManager';
import { ContractTemplateManager, ContractTemplate } from './contractTemplateManager';

/**
 * SmartContractUI Manager
 * Provides UI for creating, deploying, and interacting with smart contracts
 */
export class SmartContractUIManager implements IService {
    private context: vscode.ExtensionContext;
    private smartContractManager: SmartContractManager;
    private templateManager: ContractTemplateManager;
    private contractExplorer: vscode.TreeView<ContractTreeItem>;
    private logger: Logger;
    private eventBus: EventBus;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        const serviceRegistry = ServiceRegistry.getInstance();
        this.smartContractManager = serviceRegistry.get<SmartContractManager>('smartContractManager');
        this.templateManager = serviceRegistry.get<ContractTemplateManager>('templateManager');
        this.logger = serviceRegistry.get<Logger>('logger');
        this.eventBus = serviceRegistry.get<EventBus>('eventBus');
        
        this.logger.info('SmartContractUIManager: Initializing');
    }
    
    /**
     * Initialize the service
     */
    public async initialize(): Promise<void> {
        this.logger.debug('SmartContractUIManager: Initializing UI components');
        
        // Register tree data provider
        const treeDataProvider = new ContractTreeDataProvider(
            this.smartContractManager,
            this.templateManager
        );
        
        // Create the tree view
        this.contractExplorer = vscode.window.createTreeView('nsipLegalContracts', {
            treeDataProvider,
            showCollapseAll: true,
            canSelectMany: false
        });
        
        // Register commands
        await this.registerCommands();
        
        // Register event handlers
        this.registerEventHandlers();
        
        this.logger.info('SmartContractUIManager: Initialization complete');
    }
    
    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.logger.info('SmartContractUIManager: Disposing');
        
        if (this.contractExplorer) {
            this.contractExplorer.dispose();
        }
    }
    
    /**
     * Register commands
     */
    private async registerCommands(): Promise<void> {
        this.context.subscriptions.push(
            vscode.commands.registerCommand('nsipLegal.createContract', this.createContract.bind(this)),
            vscode.commands.registerCommand('nsipLegal.compileContract', this.compileContract.bind(this)),
            vscode.commands.registerCommand('nsipLegal.deployContract', this.deployContract.bind(this)),
            vscode.commands.registerCommand('nsipLegal.executeContract', this.executeContract.bind(this)),
            vscode.commands.registerCommand('nsipLegal.viewContract', this.viewContract.bind(this))
        );
    }
    
    /**
     * Register event handlers
     */
    private registerEventHandlers(): void {
        this.eventBus.on('contract.created', () => this.refreshContractView());
        this.eventBus.on('contract.compiled', () => this.refreshContractView());
        this.eventBus.on('contract.deployed', () => this.refreshContractView());
        this.eventBus.on('template.created', () => this.refreshContractView());
        this.eventBus.on('template.updated', () => this.refreshContractView());
        this.eventBus.on('template.deleted', () => this.refreshContractView());
    }
    
    /**
     * Refresh the contract tree view
     */
    private refreshContractView(): void {
        vscode.commands.executeCommand('nsipLegalContracts.refresh');
    }
    
    /**
     * Create a new contract from template
     */
    private async createContract(): Promise<void> {
        try {
            // Get available templates
            const templates = this.templateManager.getTemplates();
            
            // Show template picker
            const templateItems = templates.map(template => ({
                label: template.name,
                description: template.type,
                detail: template.description,
                template
            }));
            
            const selectedTemplate = await vscode.window.showQuickPick(templateItems, {
                placeHolder: 'Select a contract template',
                ignoreFocusOut: true
            });
            
            if (!selectedTemplate) {
                return;
            }
            
            // Get template parameters
            const parameters: Record<string, any> = {};
            
            for (const param of selectedTemplate.template.parameters) {
                const value = await vscode.window.showInputBox({
                    prompt: `Enter ${param.name} (${param.description})`,
                    placeHolder: param.defaultValue !== undefined ? param.defaultValue.toString() : undefined,
                    ignoreFocusOut: true,
                    validateInput: input => {
                        if (param.required && !input) {
                            return `${param.name} is required`;
                        }
                        return null;
                    }
                });
                
                if (value === undefined) {
                    return;
                }
                
                parameters[param.name] = value;
            }
            
            // Get contract name
            const contractName = await vscode.window.showInputBox({
                prompt: 'Enter a name for the contract',
                placeHolder: 'My Contract',
                ignoreFocusOut: true,
                validateInput: input => {
                    if (!input) {
                        return 'Contract name is required';
                    }
                    return null;
                }
            });
            
            if (!contractName) {
                return;
            }
            
            // Create the contract
            const contract = await this.smartContractManager.createContractFromTemplate(
                selectedTemplate.template.type,
                contractName,
                parameters
            );
            
            vscode.window.showInformationMessage(`Contract '${contractName}' created successfully`);
            
            // Open the contract in editor
            this.viewContract(contract);
        } catch (error) {
            this.logger.error('Error creating contract', error);
            vscode.window.showErrorMessage(`Error creating contract: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Compile a contract
     */
    private async compileContract(contractOrItem: SmartContract | ContractTreeItem): Promise<void> {
        try {
            const contract = this.getContractFromParam(contractOrItem);
            
            if (!contract) {
                return;
            }
            
            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Compiling contract '${contract.name}'`,
                cancellable: false
            }, async () => {
                // Compile the contract
                await this.smartContractManager.compileContract(contract.id);
            });
            
            vscode.window.showInformationMessage(`Contract '${contract.name}' compiled successfully`);
        } catch (error) {
            this.logger.error('Error compiling contract', error);
            vscode.window.showErrorMessage(`Error compiling contract: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Deploy a contract
     */
    private async deployContract(contractOrItem: SmartContract | ContractTreeItem): Promise<void> {
        try {
            const contract = this.getContractFromParam(contractOrItem);
            
            if (!contract) {
                return;
            }
            
            // Get network selection
            const networks = [
                { label: 'Ethereum', value: 'ethereum' },
                { label: 'Polygon', value: 'polygon' },
                { label: 'Arbitrum', value: 'arbitrum' },
                { label: 'Optimism', value: 'optimism' }
            ];
            
            const selectedNetwork = await vscode.window.showQuickPick(networks, {
                placeHolder: 'Select a blockchain network',
                ignoreFocusOut: true
            });
            
            if (!selectedNetwork) {
                return;
            }
            
            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Deploying contract '${contract.name}' to ${selectedNetwork.label}`,
                cancellable: false
            }, async () => {
                // Deploy the contract
                await this.smartContractManager.deployContract(contract.id, selectedNetwork.value);
            });
            
            vscode.window.showInformationMessage(
                `Contract '${contract.name}' deployed successfully to ${selectedNetwork.label}`
            );
        } catch (error) {
            this.logger.error('Error deploying contract', error);
            vscode.window.showErrorMessage(`Error deploying contract: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Execute a contract method
     */
    private async executeContract(contractOrItem: SmartContract | ContractTreeItem): Promise<void> {
        try {
            const contract = this.getContractFromParam(contractOrItem);
            
            if (!contract) {
                return;
            }
            
            // Check if contract is deployed
            if (contract.status !== 'deployed') {
                throw new Error('Contract must be deployed before execution');
            }
            
            // Get method selection
            const methods = this.getContractMethods(contract);
            
            const selectedMethod = await vscode.window.showQuickPick(methods, {
                placeHolder: 'Select a method to execute',
                ignoreFocusOut: true
            });
            
            if (!selectedMethod) {
                return;
            }
            
            // Get method parameters
            const args: any[] = [];
            
            if (selectedMethod.inputs && selectedMethod.inputs.length > 0) {
                for (const input of selectedMethod.inputs) {
                    const value = await vscode.window.showInputBox({
                        prompt: `Enter ${input.name} (${input.type})`,
                        ignoreFocusOut: true
                    });
                    
                    if (value === undefined) {
                        return;
                    }
                    
                    args.push(value);
                }
            }
            
            // Show progress
            const result = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Executing ${selectedMethod.name}() on contract '${contract.name}'`,
                cancellable: false
            }, async () => {
                // Execute the contract method
                return await this.smartContractManager.executeContractMethod(
                    contract.id,
                    selectedMethod.name,
                    args
                );
            });
            
            // Show result
            if (result.success) {
                if (result.returnValue !== undefined) {
                    // Show return value
                    const resultStr = JSON.stringify(result.returnValue, null, 2);
                    
                    // Show result in output panel
                    const outputChannel = vscode.window.createOutputChannel('NSIP Legal Contract Execution');
                    outputChannel.clear();
                    outputChannel.appendLine(`Execution Result for ${selectedMethod.name}():`);
                    outputChannel.appendLine(resultStr);
                    outputChannel.show();
                } else {
                    vscode.window.showInformationMessage(
                        `Method ${selectedMethod.name}() executed successfully`
                    );
                }
            } else {
                throw new Error(result.error || 'Unknown error during execution');
            }
        } catch (error) {
            this.logger.error('Error executing contract method', error);
            vscode.window.showErrorMessage(`Error executing contract method: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * View a contract
     */
    private async viewContract(contractOrItem: SmartContract | ContractTreeItem): Promise<void> {
        try {
            const contract = this.getContractFromParam(contractOrItem);
            
            if (!contract) {
                return;
            }
            
            // Create a temporary file with the contract source
            const tempFile = await vscode.workspace.openTextDocument({
                content: contract.source,
                language: 'solidity'
            });
            
            // Open the document
            await vscode.window.showTextDocument(tempFile);
        } catch (error) {
            this.logger.error('Error viewing contract', error);
            vscode.window.showErrorMessage(`Error viewing contract: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Get contract from parameter
     */
    private getContractFromParam(contractOrItem: SmartContract | ContractTreeItem): SmartContract | null {
        if ('id' in contractOrItem && 'name' in contractOrItem && 'type' in contractOrItem) {
            return contractOrItem as SmartContract;
        } else if ('contract' in contractOrItem) {
            return (contractOrItem as ContractTreeItem).contract;
        }
        
        return null;
    }
    
    /**
     * Get methods from contract ABI
     */
    private getContractMethods(contract: SmartContract): { name: string; inputs: any[] }[] {
        if (!contract.abi) {
            return [];
        }
        
        return contract.abi
            .filter(item => item.type === 'function')
            .map(item => ({
                name: item.name,
                inputs: item.inputs || []
            }));
    }
}

/**
 * Contract tree item
 */
export class ContractTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contract?: SmartContract,
        public readonly template?: ContractTemplate,
        public readonly type?: 'contract' | 'template' | 'category',
        public readonly categoryType?: string
    ) {
        super(label, collapsibleState);
        
        if (contract) {
            this.description = contract.status;
            this.tooltip = `${contract.name} (${contract.type})`;
            this.contextValue = `contract.${contract.status}`;
            this.iconPath = new vscode.ThemeIcon('file-code');
        } else if (template) {
            this.description = template.type;
            this.tooltip = template.description;
            this.contextValue = 'template';
            this.iconPath = new vscode.ThemeIcon('note');
        } else if (type === 'category') {
            this.contextValue = `category.${categoryType}`;
            this.iconPath = new vscode.ThemeIcon('folder');
        }
    }
}

/**
 * Contract tree data provider
 */
class ContractTreeDataProvider implements vscode.TreeDataProvider<ContractTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ContractTreeItem | undefined | null | void> = new vscode.EventEmitter<ContractTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ContractTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    
    constructor(
        private smartContractManager: SmartContractManager,
        private templateManager: ContractTemplateManager
    ) {
        // Register refresh command
        vscode.commands.registerCommand('nsipLegalContracts.refresh', () => {
            this.refresh();
        });
    }
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    
    getTreeItem(element: ContractTreeItem): vscode.TreeItem {
        return element;
    }
    
    async getChildren(element?: ContractTreeItem): Promise<ContractTreeItem[]> {
        if (!element) {
            // Root elements - Categories
            return [
                new ContractTreeItem(
                    'My Contracts',
                    vscode.TreeItemCollapsibleState.Expanded,
                    undefined,
                    undefined,
                    'category',
                    'contracts'
                ),
                new ContractTreeItem(
                    'Templates',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    undefined,
                    undefined,
                    'category',
                    'templates'
                )
            ];
        } else if (element.type === 'category' && element.categoryType === 'contracts') {
            // Contracts category - show user contracts
            const contracts = this.smartContractManager.getContracts();
            
            if (contracts.length === 0) {
                return [
                    new ContractTreeItem(
                        'No contracts found',
                        vscode.TreeItemCollapsibleState.None
                    )
                ];
            }
            
            return contracts.map(contract => 
                new ContractTreeItem(
                    contract.name,
                    vscode.TreeItemCollapsibleState.None,
                    contract
                )
            );
        } else if (element.type === 'category' && element.categoryType === 'templates') {
            // Templates category - show templates by type
            const templateTypes = Object.values(SmartContractTemplateType);
            
            return templateTypes.map(type => 
                new ContractTreeItem(
                    this.formatTemplateType(type),
                    vscode.TreeItemCollapsibleState.Collapsed,
                    undefined,
                    undefined,
                    'category',
                    `template.${type}`
                )
            );
        } else if (element.type === 'category' && element.categoryType?.startsWith('template.')) {
            // Template type category - show templates of this type
            const type = element.categoryType.split('.')[1] as SmartContractTemplateType;
            const templates = this.templateManager.getTemplatesByType(type);
            
            if (templates.length === 0) {
                return [
                    new ContractTreeItem(
                        'No templates found',
                        vscode.TreeItemCollapsibleState.None
                    )
                ];
            }
            
            return templates.map(template => 
                new ContractTreeItem(
                    template.name,
                    vscode.TreeItemCollapsibleState.None,
                    undefined,
                    template
                )
            );
        }
        
        return [];
    }
    
    private formatTemplateType(type: string): string {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
}
