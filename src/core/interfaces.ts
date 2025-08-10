/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 * 
 * Core Interfaces
 * This module defines core interfaces used throughout the NSIP Legal IDE.
 */
import * as vscode from 'vscode';

/**
 * Interface for services that can be initialized and disposed
 */
export interface IService {
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    
    /**
     * Dispose the service and release resources
     */
    dispose(): void;
}

/**
 * Interface for service provider that can register and access services
 */
export interface IServiceProvider {
    /**
     * Get a service by type
     * 
     * @param type Service type to retrieve
     * @returns The service instance
     */
    getService<T>(type: string): T | null;
}

/**
 * Interface for event handlers
 */
export interface IEventHandler<T = unknown> {
    (data: T): void | Promise<void>;
}

/**
 * Interface for typed event data
 */
export interface EventData<T = unknown> {
    type: string;
    payload: T;
    timestamp: number;
    source?: string;
}

/**
 * Interface for event emitters
 */
export interface IEventEmitter {
    /**
     * Register an event handler
     * 
     * @param event Event name
     * @param handler Event handler function
     */
    on<T>(event: string, handler: IEventHandler<T>): void;
    
    /**
     * Unregister an event handler
     * 
     * @param event Event name
     * @param handler Event handler function
     */
    off<T>(event: string, handler: IEventHandler<T>): void;
    
    /**
     * Emit an event
     * 
     * @param event Event name
     * @param data Event data
     */
    emit<T>(event: string, data: T): void;
}

/**
 * Interface for logging
 */
export interface ILogger {
    /**
     * Log a debug message
     * 
     * @param message Log message
     * @param data Optional data to log
     */
    debug(message: string, data?: unknown): void;
    
    /**
     * Log an info message
     * 
     * @param message Log message
     * @param data Optional data to log
     */
    info(message: string, data?: unknown): void;
    
    /**
     * Log a warning message
     * 
     * @param message Log message
     * @param data Optional data to log
     */
    warn(message: string, data?: unknown): void;
    
    /**
     * Log an error message
     * 
     * @param message Log message
     * @param data Optional data to log
     */
    error(message: string, error?: unknown): void;
}

/**
 * Template interface
 */
export interface ITemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    content: string;
    variables: ITemplateVariable[];
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Template variable interface
 */
export interface ITemplateVariable {
    name: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'select';
    required: boolean;
    defaultValue?: string | number | boolean | Date;
    options?: string[]; // For select type
}

/**
 * Legal document interface
 */
export interface ILegalDocument {
    id: string;
    name: string;
    content: string;
    templateId?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, unknown>;
}

/**
 * Compliance rule interface
 */
export interface IComplianceRule {
    id: string;
    name: string;
    description: string;
    jurisdiction: string;
    severity: 'error' | 'warning' | 'info';
    validate(document: ILegalDocument): IComplianceIssue[];
}

/**
 * Compliance issue interface
 */
export interface IComplianceIssue {
    ruleId: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    line?: number;
    column?: number;
    suggestion?: string;
}

/**
 * Document intelligence result
 */
export interface IDocumentAnalysis {
    entities: IEntity[];
    clauses: IClause[];
    issues: IComplianceIssue[];
    metadata: Record<string, unknown>;
}

/**
 * Entity interface for named entities in documents
 */
export interface IEntity {
    id: string;
    type: 'person' | 'organization' | 'location' | 'date' | 'money' | 'percent' | 'other';
    text: string;
    startIndex: number;
    endIndex: number;
    metadata?: Record<string, unknown>;
}

/**
 * Clause interface for legal clauses
 */
export interface IClause {
    id: string;
    type: string;
    title?: string;
    content: string;
    startIndex: number;
    endIndex: number;
    entities: IEntity[];
    issues?: IComplianceIssue[];
    metadata?: Record<string, unknown>;
}

/**
 * WebView panel provider interface
 */
export interface IWebViewProvider {
    createWebView(viewType: string, title: string, column: vscode.ViewColumn, options?: vscode.WebviewPanelOptions): vscode.WebviewPanel;
    registerMessageHandler(handler: (message: any) => void): void;
    postMessage(message: any): Thenable<boolean>;
    dispose(): void;
}
