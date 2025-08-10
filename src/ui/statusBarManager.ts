import * as vscode from 'vscode';
import { IService } from '../core/interfaces';
import { Logger } from '../core/logger';

/**
 * Interface for status bar service
 */
export interface IStatusBarManager extends IService {
    /**
     * Show a message in the status bar
     * @param message The message to display
     * @param tooltip Optional tooltip to show on hover
     */
    showMessage(message: string, tooltip?: string): void;
    
    /**
     * Show a compliance status indicator in the status bar
     * @param score Compliance score between 0 and 1
     * @param tooltip Optional tooltip to show on hover
     */
    showComplianceStatus(score: number, tooltip?: string): void;
    
    /**
     * Hide the status bar item
     */
    hide(): void;
}

/**
 * Implementation of the status bar service
 */
export class StatusBarManager implements IStatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private logger: Logger;
    
    constructor(logger: Logger) {
        this.logger = logger;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'nsip.showDashboard';
    }
    
    public async initialize(): Promise<void> {
        this.statusBarItem.show();
        this.showMessage('NSIP Legal IDE Ready');
        this.logger.debug('StatusBarManager initialized');
    }
    
    public dispose(): void {
        this.statusBarItem.dispose();
        this.logger.debug('StatusBarManager disposed');
    }
    
    public showMessage(message: string, tooltip?: string): void {
        this.statusBarItem.text = `$(law) ${message}`;
        this.statusBarItem.tooltip = tooltip || 'NSIP Legal IDE';
        this.statusBarItem.show();
        this.logger.debug(`Status bar message: ${message}`);
    }
    
    public showComplianceStatus(score: number, tooltip?: string): void {
        // Format the score as a percentage
        const percentage = Math.round(score * 100);
        
        // Choose an icon based on the score
        let icon = '$(error)';
        if (score >= 0.9) {
            icon = '$(check)';
        } else if (score >= 0.7) {
            icon = '$(warning)';
        }
        
        // Update the status bar
        this.statusBarItem.text = `${icon} Compliance: ${percentage}%`;
        this.statusBarItem.tooltip = tooltip || `Document compliance score: ${percentage}%`;
        this.statusBarItem.show();
        
        this.logger.debug(`Status bar compliance update: ${percentage}%`);
    }
    
    public hide(): void {
        this.statusBarItem.hide();
        this.logger.debug('Status bar hidden');
    }
}
