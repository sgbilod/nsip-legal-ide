import * as vscode from 'vscode';
import { Logger } from '../core/logger';
import { IService } from '../core/interfaces';

export interface INotificationManager extends IService {
    /**
     * Show an information message to the user
     * @param message The message to display
     * @param options Optional items to display in the message
     */
    showInformation(message: string, ...options: string[]): Promise<string | undefined>;
    
    /**
     * Show a warning message to the user
     * @param message The message to display
     * @param options Optional items to display in the message
     */
    showWarning(message: string, ...options: string[]): Promise<string | undefined>;
    
    /**
     * Show an error message to the user
     * @param message The message to display
     * @param options Optional items to display in the message
     */
    showError(message: string, ...options: string[]): Promise<string | undefined>;
    
    /**
     * Show a progress notification with the given title
     * @param title The title of the progress notification
     * @param task The task to execute with progress reporting
     */
    withProgress<T>(title: string, task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Thenable<T>): Thenable<T>;
}

export class NotificationManager implements INotificationManager {
    private logger: Logger;
    
    constructor(logger: Logger) {
        this.logger = logger;
    }
    
    public getId(): string {
        return 'notificationManager';
    }
    
    public async initialize(): Promise<void> {
        this.logger.debug('NotificationManager initialized');
    }
    
    public dispose(): void {
        this.logger.debug('NotificationManager disposed');
    }
    
    public async showInformation(message: string, ...options: string[]): Promise<string | undefined> {
        this.logger.info(`Showing info: ${message}`);
        return vscode.window.showInformationMessage(message, ...options);
    }
    
    public async showWarning(message: string, ...options: string[]): Promise<string | undefined> {
        this.logger.warn(`Showing warning: ${message}`);
        return vscode.window.showWarningMessage(message, ...options);
    }
    
    public async showError(message: string, ...options: string[]): Promise<string | undefined> {
        this.logger.error(`Showing error: ${message}`);
        return vscode.window.showErrorMessage(message, ...options);
    }
    
    public withProgress<T>(title: string, task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Thenable<T>): Thenable<T> {
        this.logger.debug(`Starting progress: ${title}`);
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title,
                cancellable: false
            },
            task
        );
    }
}
