import * as vscode from 'vscode';
import { IService } from './serviceRegistry';

/**
 * Log levels for the extension
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

/**
 * Logger - Provides logging functionality for the extension
 */
export class Logger implements IService {
    private outputChannel: vscode.OutputChannel;
    private logLevel: LogLevel = LogLevel.INFO;
    
    /**
     * Create a new logger instance
     * @param context Extension context
     */
    constructor(private context: vscode.ExtensionContext) {
        this.outputChannel = vscode.window.createOutputChannel('NSIP Legal IDE');
        this.context.subscriptions.push(this.outputChannel);
        
        // Get log level from configuration
        this.updateLogLevelFromConfig();
        
        // Listen for configuration changes
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('nsip.logging.level')) {
                    this.updateLogLevelFromConfig();
                }
            })
        );
    }
    
    /**
     * Initialize the logger
     */
    async initialize(): Promise<void> {
        this.info('Logger initialized');
    }
    
    /**
     * Update log level from VS Code configuration
     */
    private updateLogLevelFromConfig(): void {
        const config = vscode.workspace.getConfiguration('nsip');
        const configLevel = config.get<string>('logging.level', 'info');
        
        switch (configLevel.toLowerCase()) {
            case 'debug':
                this.logLevel = LogLevel.DEBUG;
                break;
            case 'info':
                this.logLevel = LogLevel.INFO;
                break;
            case 'warn':
                this.logLevel = LogLevel.WARN;
                break;
            case 'error':
                this.logLevel = LogLevel.ERROR;
                break;
            default:
                this.logLevel = LogLevel.INFO;
        }
        
        this.info(`Log level set to ${LogLevel[this.logLevel]}`);
    }
    
    /**
     * Log a debug message
     * @param message The message to log
     * @param data Optional data to log
     */
    debug(message: string, data?: any): void {
        this.log(LogLevel.DEBUG, message, data);
    }
    
    /**
     * Log an info message
     * @param message The message to log
     * @param data Optional data to log
     */
    info(message: string, data?: any): void {
        this.log(LogLevel.INFO, message, data);
    }
    
    /**
     * Log a warning message
     * @param message The message to log
     * @param data Optional data to log
     */
    warn(message: string, data?: any): void {
        this.log(LogLevel.WARN, message, data);
    }
    
    /**
     * Log an error message
     * @param message The message to log
     * @param error Optional error to log
     */
    error(message: string, error?: any): void {
        this.log(LogLevel.ERROR, message, error);
    }
    
    /**
     * Log a message at the specified level
     * @param level The log level
     * @param message The message to log
     * @param data Optional data to log
     */
    private log(level: LogLevel, message: string, data?: any): void {
        if (level < this.logLevel) {
            return;
        }
        
        const timestamp = new Date().toISOString();
        const levelString = LogLevel[level].padEnd(5);
        
        let logMessage = `[${timestamp}] [${levelString}] ${message}`;
        
        if (data) {
            if (data instanceof Error) {
                logMessage += `\n${data.stack || data.message}`;
            } else {
                try {
                    logMessage += `\n${JSON.stringify(data, null, 2)}`;
                } catch {
                    logMessage += `\n${data}`;
                }
            }
        }
        
        this.outputChannel.appendLine(logMessage);
        
        // Show output channel for errors if not already visible
        if (level === LogLevel.ERROR) {
            this.outputChannel.show(true);
        }
    }
    
    /**
     * Dispose the logger
     */
    dispose(): void {
        // OutputChannel is automatically disposed by the extension context
    }
}
