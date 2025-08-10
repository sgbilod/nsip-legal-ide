/**
 * Contract Template Manager
 * Manages and provides templates for legal smart contracts
 */

import { IService } from '../core/interfaces';
import { Logger } from '../core/logger';
import { EventBus } from '../core/eventBus';
import { ServiceRegistry } from '../core/serviceRegistry';
import { SmartContractTemplateType } from './smartContractManager';

/**
 * Template data structure
 */
export interface ContractTemplate {
    id: string;
    name: string;
    description: string;
    type: SmartContractTemplateType;
    source: string;
    parameters: {
        name: string;
        type: string;
        description: string;
        required: boolean;
        defaultValue?: any;
    }[];
    createdAt: Date;
    updatedAt: Date;
    version: string;
    author: string;
    tags: string[];
}

/**
 * ContractTemplateManager Service
 * Provides templates for creating legal smart contracts
 */
export class ContractTemplateManager implements IService {
    private templates: Map<string, ContractTemplate> = new Map();
    private logger: Logger;
    private eventBus: EventBus;
    
    constructor() {
        const serviceRegistry = ServiceRegistry.getInstance();
        this.logger = serviceRegistry.get<Logger>('logger');
        this.eventBus = serviceRegistry.get<EventBus>('eventBus');
        
        this.logger.info('ContractTemplateManager: Initializing');
    }
    
    /**
     * Initialize the service
     */
    public async initialize(): Promise<void> {
        // Load built-in templates
        await this.loadBuiltInTemplates();
        
        // Load custom templates from storage
        await this.loadCustomTemplates();
        
        // Try to load templates from filesystem
        await this.loadTemplatesFromFileSystem();
        
        // Register event handlers
        this.eventBus.on('template.created', this.onTemplateCreated.bind(this));
        this.eventBus.on('template.updated', this.onTemplateUpdated.bind(this));
        this.eventBus.on('template.deleted', this.onTemplateDeleted.bind(this));
        
        this.logger.info(`ContractTemplateManager: Initialized with ${this.templates.size} templates`);
    }
    
    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.logger.info('ContractTemplateManager: Disposing');
        
        // Unregister event handlers
        this.eventBus.off('template.created', this.onTemplateCreated.bind(this));
        this.eventBus.off('template.updated', this.onTemplateUpdated.bind(this));
        this.eventBus.off('template.deleted', this.onTemplateDeleted.bind(this));
    }
    
    /**
     * Get all available templates
     */
    public getTemplates(): ContractTemplate[] {
        return Array.from(this.templates.values());
    }
    
    /**
     * Get templates by type
     */
    public getTemplatesByType(type: SmartContractTemplateType): ContractTemplate[] {
        return this.getTemplates().filter(template => template.type === type);
    }
    
    /**
     * Get a template by ID
     */
    public getTemplate(id: string): ContractTemplate | undefined {
        return this.templates.get(id);
    }
    
    /**
     * Create a new custom template
     */
    public async createTemplate(template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate> {
        const id = this.generateId();
        const now = new Date();
        
        const newTemplate: ContractTemplate = {
            ...template,
            id,
            createdAt: now,
            updatedAt: now
        };
        
        // Save the template
        this.templates.set(id, newTemplate);
        await this.saveTemplate(newTemplate);
        
        // Emit event
        this.eventBus.emit('template.created', { template: newTemplate });
        
        return newTemplate;
    }
    
    /**
     * Update an existing template
     */
    public async updateTemplate(id: string, updates: Partial<Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ContractTemplate> {
        const template = this.getTemplate(id);
        
        if (!template) {
            throw new Error(`Template not found: ${id}`);
        }
        
        const updatedTemplate: ContractTemplate = {
            ...template,
            ...updates,
            updatedAt: new Date()
        };
        
        // Save the updated template
        this.templates.set(id, updatedTemplate);
        await this.saveTemplate(updatedTemplate);
        
        // Emit event
        this.eventBus.emit('template.updated', { template: updatedTemplate });
        
        return updatedTemplate;
    }
    
    /**
     * Delete a template
     */
    public async deleteTemplate(id: string): Promise<void> {
        const template = this.getTemplate(id);
        
        if (!template) {
            throw new Error(`Template not found: ${id}`);
        }
        
        // Remove the template
        this.templates.delete(id);
        await this.deleteTemplateFromStorage(id);
        
        // Emit event
        this.eventBus.emit('template.deleted', { templateId: id });
    }
    
    /**
     * Load built-in templates
     */
    private async loadBuiltInTemplates(): Promise<void> {
        this.logger.debug('ContractTemplateManager: Loading built-in templates');
        
        // Agreement template
        const agreementTemplate: ContractTemplate = {
            id: 'builtin_agreement',
            name: 'Standard Agreement',
            description: 'A general-purpose agreement template with standard clauses',
            type: SmartContractTemplateType.AGREEMENT,
            source: this.getAgreementTemplateSource(),
            parameters: [
                {
                    name: 'partyA',
                    type: 'string',
                    description: 'First party to the agreement',
                    required: true
                },
                {
                    name: 'partyB',
                    type: 'string',
                    description: 'Second party to the agreement',
                    required: true
                },
                {
                    name: 'amount',
                    type: 'uint256',
                    description: 'Contract value',
                    required: true
                },
                {
                    name: 'duration',
                    type: 'uint256',
                    description: 'Duration in days',
                    required: true,
                    defaultValue: 30
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0',
            author: 'NSIP Legal IDE',
            tags: ['agreement', 'standard', 'contract']
        };
        
        // Escrow template
        const escrowTemplate: ContractTemplate = {
            id: 'builtin_escrow',
            name: 'Escrow Contract',
            description: 'An escrow contract for holding funds until conditions are met',
            type: SmartContractTemplateType.ESCROW,
            source: this.getEscrowTemplateSource(),
            parameters: [
                {
                    name: 'buyer',
                    type: 'address',
                    description: 'Buyer address',
                    required: true
                },
                {
                    name: 'seller',
                    type: 'address',
                    description: 'Seller address',
                    required: true
                },
                {
                    name: 'arbiter',
                    type: 'address',
                    description: 'Arbiter address',
                    required: true
                },
                {
                    name: 'value',
                    type: 'uint256',
                    description: 'Contract value',
                    required: true
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0',
            author: 'NSIP Legal IDE',
            tags: ['escrow', 'payment', 'arbitration']
        };
        
        // IP License template
        const ipLicenseTemplate: ContractTemplate = {
            id: 'builtin_ip_license',
            name: 'IP License Agreement',
            description: 'A contract for licensing intellectual property',
            type: SmartContractTemplateType.IP_LICENSE,
            source: this.getIPLicenseTemplateSource(),
            parameters: [
                {
                    name: 'licensor',
                    type: 'address',
                    description: 'Licensor address',
                    required: true
                },
                {
                    name: 'licensee',
                    type: 'address',
                    description: 'Licensee address',
                    required: true
                },
                {
                    name: 'assetId',
                    type: 'string',
                    description: 'IP asset identifier',
                    required: true
                },
                {
                    name: 'licenseFee',
                    type: 'uint256',
                    description: 'License fee',
                    required: true
                },
                {
                    name: 'duration',
                    type: 'uint256',
                    description: 'License duration in days',
                    required: true,
                    defaultValue: 365
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0',
            author: 'NSIP Legal IDE',
            tags: ['ip', 'license', 'intellectual property']
        };
        
        // Add templates to the registry
        this.templates.set(agreementTemplate.id, agreementTemplate);
        this.templates.set(escrowTemplate.id, escrowTemplate);
        this.templates.set(ipLicenseTemplate.id, ipLicenseTemplate);
        
        this.logger.debug('ContractTemplateManager: Built-in templates loaded');
    }
    
    /**
     * Load custom templates from storage
     */
    private async loadCustomTemplates(): Promise<void> {
        this.logger.debug('ContractTemplateManager: Loading custom templates');
        
        // In a real implementation, this would load from storage
        // For now, we'll just use a mock implementation
        
        this.logger.debug('ContractTemplateManager: Custom templates loaded');
    }
    
    /**
     * Save a template to storage
     */
    private async saveTemplate(template: ContractTemplate): Promise<void> {
        this.logger.debug(`ContractTemplateManager: Saving template ${template.id}`);
        
        // In a real implementation, this would save to storage
    }
    
    /**
     * Delete a template from storage
     */
    private async deleteTemplateFromStorage(id: string): Promise<void> {
        this.logger.debug(`ContractTemplateManager: Deleting template ${id}`);
        
        // In a real implementation, this would delete from storage
    }
    
    /**
     * Load templates from filesystem
     */
    private async loadTemplatesFromFileSystem(): Promise<void> {
        try {
            this.logger.info('ContractTemplateManager: Loading templates from filesystem');
            
            // Get extension path
            const vscode = require('vscode');
            const fs = require('fs');
            const path = require('path');
            
            const extension = vscode.extensions.getExtension('nsip-legal-ide');
            if (!extension) {
                this.logger.warn('ContractTemplateManager: Extension not found');
                return;
            }
            
            const extensionPath = extension.extensionUri.fsPath;
            
            // Path to contract templates JSON
            const templatesJsonPath = path.join(extensionPath, 'templates', 'contracts', 'contract-templates.json');
            
            // Check if file exists
            if (!fs.existsSync(templatesJsonPath)) {
                this.logger.warn(`ContractTemplateManager: Templates file not found at ${templatesJsonPath}`);
                return;
            }
            
            // Read and parse templates file
            const templatesData = JSON.parse(fs.readFileSync(templatesJsonPath, 'utf8'));
            
            // Process each template
            for (const template of templatesData.templates) {
                // Map template type based on category
                let type: SmartContractTemplateType;
                switch (template.category) {
                    case 'agreements':
                        type = SmartContractTemplateType.AGREEMENT;
                        break;
                    case 'escrow':
                        type = SmartContractTemplateType.ESCROW;
                        break;
                    case 'licensing':
                        type = SmartContractTemplateType.IP_LICENSE;
                        break;
                    default:
                        type = SmartContractTemplateType.AGREEMENT;
                }
                
                // Read template source file
                const templatePath = path.join(extensionPath, template.path);
                let source = '';
                if (fs.existsSync(templatePath)) {
                    source = fs.readFileSync(templatePath, 'utf8');
                } else {
                    this.logger.warn(`ContractTemplateManager: Template source file not found at ${templatePath}`);
                    continue;
                }
                
                // Add template to manager
                const id = `filesystem_${template.id}`;
                const now = new Date();
                
                this.templates.set(id, {
                    id,
                    name: template.name,
                    description: template.description,
                    type,
                    source,
                    parameters: template.parameters.map((p: any) => ({
                        name: p.name,
                        type: p.type,
                        description: p.description,
                        required: p.required,
                        defaultValue: p.defaultValue
                    })),
                    createdAt: now,
                    updatedAt: now,
                    version: '1.0.0',
                    author: 'NSIP Legal IDE',
                    tags: [template.category]
                });
            }
            
            this.logger.info(`ContractTemplateManager: Loaded ${templatesData.templates.length} templates from filesystem`);
        } catch (error) {
            this.logger.error('ContractTemplateManager: Error loading templates from filesystem', error);
        }
    }
    
    /**
     * Handle template created event
     */
    private onTemplateCreated(data: { template: ContractTemplate }): void {
        this.logger.debug(`ContractTemplateManager: Template created: ${data.template.id}`);
    }
    
    /**
     * Handle template updated event
     */
    private onTemplateUpdated(data: { template: ContractTemplate }): void {
        this.logger.debug(`ContractTemplateManager: Template updated: ${data.template.id}`);
    }
    
    /**
     * Handle template deleted event
     */
    private onTemplateDeleted(data: { templateId: string }): void {
        this.logger.debug(`ContractTemplateManager: Template deleted: ${data.templateId}`);
    }
    
    /**
     * Generate a unique ID
     */
    private generateId(): string {
        return 'template_' + Date.now() + '_' + 
            Math.random().toString(36).substring(2, 15);
    }
    
    /**
     * Get Agreement template source code
     */
    private getAgreementTemplateSource(): string {
        return `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Standard Agreement Contract
 * @dev A general-purpose agreement template with standard clauses
 */
contract StandardAgreement {
    address public partyA;
    address public partyB;
    uint256 public amount;
    uint256 public duration;
    uint256 public startDate;
    bool public isActive;
    bool public isComplete;
    
    event AgreementCreated(address partyA, address partyB, uint256 amount, uint256 duration);
    event PaymentReceived(address from, uint256 amount);
    event AgreementCompleted();
    event DisputeRaised(address disputant, string reason);
    event DisputeResolved(bool resolved);
    
    constructor(
        address _partyA,
        address _partyB,
        uint256 _amount,
        uint256 _duration
    ) {
        partyA = _partyA;
        partyB = _partyB;
        amount = _amount;
        duration = _duration;
        startDate = block.timestamp;
        isActive = true;
        
        emit AgreementCreated(partyA, partyB, amount, duration);
    }
    
    modifier onlyParties() {
        require(msg.sender == partyA || msg.sender == partyB, "Only parties can call this function");
        _;
    }
    
    function completeAgreement() external onlyParties {
        require(isActive, "Agreement is not active");
        require(!isComplete, "Agreement is already complete");
        
        isComplete = true;
        isActive = false;
        
        emit AgreementCompleted();
    }
    
    function raiseDispute(string calldata reason) external onlyParties {
        require(isActive, "Agreement is not active");
        
        emit DisputeRaised(msg.sender, reason);
    }
    
    function resolveDispute(bool resolution) external onlyParties {
        require(isActive, "Agreement is not active");
        
        if (!resolution) {
            isActive = false;
        }
        
        emit DisputeResolved(resolution);
    }
    
    function isExpired() public view returns (bool) {
        return block.timestamp > startDate + duration * 1 days;
    }
    
    function remainingTime() public view returns (uint256) {
        if (isExpired()) {
            return 0;
        }
        
        return (startDate + duration * 1 days) - block.timestamp;
    }
    
    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }
}`;
    }
    
    /**
     * Get Escrow template source code
     */
    private getEscrowTemplateSource(): string {
        return `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Escrow Contract
 * @dev An escrow contract for holding funds until conditions are met
 */
contract EscrowContract {
    address public buyer;
    address public seller;
    address public arbiter;
    uint256 public value;
    bool public isReleased;
    bool public isRefunded;
    bool public isDisputed;
    
    event Deposited(address from, uint256 amount);
    event Released(uint256 amount);
    event Refunded(uint256 amount);
    event DisputeRaised(string reason);
    event DisputeResolved(bool releasedToSeller);
    
    constructor(
        address _buyer,
        address _seller,
        address _arbiter,
        uint256 _value
    ) {
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
        value = _value;
    }
    
    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this function");
        _;
    }
    
    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this function");
        _;
    }
    
    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Only arbiter can call this function");
        _;
    }
    
    modifier inState(bool _released, bool _refunded, bool _disputed) {
        require(isReleased == _released && isRefunded == _refunded && isDisputed == _disputed);
        _;
    }
    
    function deposit() external payable onlyBuyer inState(false, false, false) {
        require(msg.value == value, "Deposit amount must match the value");
        
        emit Deposited(msg.sender, msg.value);
    }
    
    function release() external onlyBuyer inState(false, false, false) {
        isReleased = true;
        payable(seller).transfer(address(this).balance);
        
        emit Released(value);
    }
    
    function refund() external onlySeller inState(false, false, false) {
        isRefunded = true;
        payable(buyer).transfer(address(this).balance);
        
        emit Refunded(value);
    }
    
    function raiseDispute(string calldata reason) external onlyBuyer inState(false, false, false) {
        isDisputed = true;
        
        emit DisputeRaised(reason);
    }
    
    function resolveDispute(bool releasedToSeller) external onlyArbiter inState(false, false, true) {
        if (releasedToSeller) {
            isReleased = true;
            payable(seller).transfer(address(this).balance);
        } else {
            isRefunded = true;
            payable(buyer).transfer(address(this).balance);
        }
        
        emit DisputeResolved(releasedToSeller);
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`;
    }
    
    /**
     * Get IP License template source code
     */
    private getIPLicenseTemplateSource(): string {
        return `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IP License Agreement
 * @dev A contract for licensing intellectual property
 */
contract IPLicenseAgreement {
    address public licensor;
    address public licensee;
    string public assetId;
    uint256 public licenseFee;
    uint256 public duration;
    uint256 public startDate;
    bool public isActive;
    
    event LicenseCreated(address licensor, address licensee, string assetId, uint256 fee, uint256 duration);
    event LicenseFeeReceived(uint256 amount);
    event LicenseTerminated();
    event LicenseRenewed(uint256 newDuration);
    
    constructor(
        address _licensor,
        address _licensee,
        string memory _assetId,
        uint256 _licenseFee,
        uint256 _duration
    ) {
        licensor = _licensor;
        licensee = _licensee;
        assetId = _assetId;
        licenseFee = _licenseFee;
        duration = _duration;
        startDate = block.timestamp;
        isActive = true;
        
        emit LicenseCreated(licensor, licensee, assetId, licenseFee, duration);
    }
    
    modifier onlyLicensor() {
        require(msg.sender == licensor, "Only licensor can call this function");
        _;
    }
    
    modifier onlyLicensee() {
        require(msg.sender == licensee, "Only licensee can call this function");
        _;
    }
    
    function terminateLicense() external onlyLicensor {
        require(isActive, "License is not active");
        
        isActive = false;
        
        emit LicenseTerminated();
    }
    
    function renewLicense(uint256 newDuration) external payable onlyLicensee {
        require(isActive, "License is not active");
        require(msg.value == licenseFee, "Payment must match license fee");
        
        duration += newDuration;
        
        emit LicenseRenewed(newDuration);
    }
    
    function isExpired() public view returns (bool) {
        return block.timestamp > startDate + duration * 1 days;
    }
    
    function remainingTime() public view returns (uint256) {
        if (isExpired()) {
            return 0;
        }
        
        return (startDate + duration * 1 days) - block.timestamp;
    }
    
    receive() external payable {
        require(msg.sender == licensee, "Only licensee can send payments");
        require(msg.value == licenseFee, "Payment must match license fee");
        
        payable(licensor).transfer(msg.value);
        
        emit LicenseFeeReceived(msg.value);
    }
}`;
    }
}
