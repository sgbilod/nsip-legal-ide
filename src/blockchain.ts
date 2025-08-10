/**
 * Register blockchain components
 * Initializes the blockchain services for the NSIP Legal IDE
 */

import * as vscode from 'vscode';
import { ServiceRegistry } from './core/serviceRegistry';
import { Logger } from './core/logger';
import { EventBus } from './core/eventBus';
import { MultiChainPlatform } from './blockchain/multiChainPlatform';
import { DecentralizedIdentityService } from './blockchain/decentralizedIdentity';
import { SmartContractManager } from './blockchain/smartContractManager';
import { ContractTemplateManager } from './blockchain/contractTemplateManager';
import { SmartContractUIManager } from './blockchain/smartContractUIManager';
import { createMultiChainAdapter } from './blockchain/extension';

/**
 * Initialize blockchain components
 * @param context Extension context
 */
export async function initializeBlockchainComponents(context: vscode.ExtensionContext): Promise<void> {
    const serviceRegistry = ServiceRegistry.getInstance();
    const logger = serviceRegistry.get<Logger>('logger');
    const eventBus = serviceRegistry.get<EventBus>('eventBus');
    
    logger.info('Initializing blockchain components');
    
    try {
        // Initialize MultiChainPlatform
        const multiChainPlatform = new MultiChainPlatform();
        await multiChainPlatform.initialize();
        serviceRegistry.register('multiChainPlatform', multiChainPlatform);
        
        // Initialize DecentralizedIdentityService
        const decentralizedIdentity = new DecentralizedIdentityService();
        await decentralizedIdentity.initialize();
        serviceRegistry.register('decentralizedIdentity', decentralizedIdentity);
        
        // Create Adapter for MultiChainPlatform
        const chainAdapter = createMultiChainAdapter(multiChainPlatform);
        
        // Initialize SmartContractManager
        const smartContractManager = new SmartContractManager(
            multiChainPlatform,
            decentralizedIdentity,
            logger,
            eventBus
        );
        await smartContractManager.initialize();
        serviceRegistry.register('smartContractManager', smartContractManager);
        
        // Initialize ContractTemplateManager
        const templateManager = new ContractTemplateManager();
        await templateManager.initialize();
        serviceRegistry.register('contractTemplateManager', templateManager);
        
        // Initialize SmartContractUIManager
        const uiManager = new SmartContractUIManager(context);
        await uiManager.initialize();
        serviceRegistry.register('smartContractUIManager', uiManager);
        
        // Register disposal logic
        context.subscriptions.push({
            dispose: () => {
                logger.info('Disposing blockchain components');
                multiChainPlatform.dispose();
                decentralizedIdentity.dispose();
                smartContractManager.dispose();
                templateManager.dispose();
                uiManager.dispose();
            }
        });
        
        logger.info('Blockchain components initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize blockchain components', error);
        throw error;
    }
}
