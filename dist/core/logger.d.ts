import * as vscode from 'vscode';
import { IService } from './serviceRegistry';
/**
 * Log levels for the extension
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
/**
 * Logger - Provides logging functionality for the extension
 */
export declare class Logger implements IService {
    private context;
    private outputChannel;
    private logLevel;
    /**
     * Create a new logger instance
     * @param context Extension context
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize the logger
     */
    initialize(): Promise<void>;
    /**
     * Update log level from VS Code configuration
     */
    private updateLogLevelFromConfig;
    /**
     * Log a debug message
     * @param message The message to log
     * @param data Optional data to log
     */
    debug(message: string, data?: any): void;
    /**
     * Log an info message
     * @param message The message to log
     * @param data Optional data to log
     */
    info(message: string, data?: any): void;
    /**
     * Log a warning message
     * @param message The message to log
     * @param data Optional data to log
     */
    warn(message: string, data?: any): void;
    /**
     * Log an error message
     * @param message The message to log
     * @param error Optional error to log
     */
    error(message: string, error?: any): void;
    /**
     * Log a message at the specified level
     * @param level The log level
     * @param message The message to log
     * @param data Optional data to log
     */
    private log;
    /**
     * Dispose the logger
     */
    dispose(): void;
}
