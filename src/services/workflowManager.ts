import { IService, IEventEmitter } from '../core/interfaces';
import { DocumentStatus } from './legalDocumentManager';
import * as vscode from 'vscode';

/**
 * Workflow step type
 */
export enum WorkflowStepType {
    Review = 'review',
    Approval = 'approval',
    Signature = 'signature',
    Distribution = 'distribution',
    Custom = 'custom'
}

/**
 * Workflow step status
 */
export enum WorkflowStepStatus {
    Pending = 'pending',
    InProgress = 'in-progress',
    Completed = 'completed',
    Rejected = 'rejected',
    Blocked = 'blocked'
}

/**
 * Workflow step definition
 */
export interface WorkflowStep {
    id: string;
    type: WorkflowStepType;
    name: string;
    description: string;
    assignee: string;
    status: WorkflowStepStatus;
    dueDate?: string;
    completedAt?: string;
    comments?: string[];
}

/**
 * Workflow definition
 */
export interface Workflow {
    id: string;
    documentId: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    currentStep: number;
    status: WorkflowStepStatus;
    createdAt: string;
    modifiedAt: string;
}

/**
 * Service for managing document workflows
 */
export class WorkflowManager implements IService {
    private eventBus: IEventEmitter;
    private workflows: Map<string, Workflow>;
    
    constructor(eventBus: IEventEmitter) {
        this.eventBus = eventBus;
        this.workflows = new Map();
    }
    
    async initialize(): Promise<void> {
        // Subscribe to relevant events
        this.eventBus.on('document.created', this.handleDocumentCreated.bind(this));
        this.eventBus.on('document.statusChanged', this.handleDocumentStatusChanged.bind(this));
    }
    
    async dispose(): Promise<void> {
        // Clear workflows
        this.workflows.clear();
    }
    
    /**
     * Create a new workflow for a document
     */
    async createWorkflow(documentId: string, template: string): Promise<Workflow> {
        const workflow = await this.generateWorkflow(documentId, template);
        this.workflows.set(workflow.id, workflow);
        
        this.eventBus.emit('workflow.created', workflow);
        return workflow;
    }
    
    /**
     * Get workflow by ID
     */
    getWorkflow(id: string): Workflow | undefined {
        return this.workflows.get(id);
    }
    
    /**
     * Get workflow for a document
     */
    getWorkflowForDocument(documentId: string): Workflow | undefined {
        return Array.from(this.workflows.values()).find(
            w => w.documentId === documentId
        );
    }
    
    /**
     * Update workflow step status
     */
    async updateStepStatus(
        workflowId: string, 
        stepId: string, 
        status: WorkflowStepStatus,
        comment?: string
    ): Promise<void> {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }
        
        const step = workflow.steps.find(s => s.id === stepId);
        if (!step) {
            throw new Error(`Step ${stepId} not found in workflow ${workflowId}`);
        }
        
        const oldStatus = step.status;
        step.status = status;
        
        if (status === WorkflowStepStatus.Completed) {
            step.completedAt = new Date().toISOString();
        }
        
        if (comment) {
            step.comments = step.comments || [];
            step.comments.push(comment);
        }
        
        workflow.modifiedAt = new Date().toISOString();
        
        // Update workflow status
        this.updateWorkflowStatus(workflow);
        
        this.eventBus.emit('workflow.stepUpdated', {
            workflowId,
            stepId,
            oldStatus,
            newStatus: status,
            comment
        });
    }
    
    /**
     * Move to next workflow step
     */
    async moveToNextStep(workflowId: string): Promise<void> {
        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }
        
        if (workflow.currentStep >= workflow.steps.length - 1) {
            throw new Error('Already at last step');
        }
        
        const currentStep = workflow.steps[workflow.currentStep];
        if (currentStep.status !== WorkflowStepStatus.Completed) {
            throw new Error('Current step must be completed before moving to next step');
        }
        
        workflow.currentStep++;
        workflow.modifiedAt = new Date().toISOString();
        
        const nextStep = workflow.steps[workflow.currentStep];
        nextStep.status = WorkflowStepStatus.InProgress;
        
        this.eventBus.emit('workflow.stepChanged', {
            workflowId,
            previousStep: workflow.currentStep - 1,
            currentStep: workflow.currentStep
        });
    }
    
    private async generateWorkflow(documentId: string, template: string): Promise<Workflow> {
        // Generate a unique ID
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        
        // In a real implementation, this would load steps from a template
        // For now, create some sample steps
        const steps: WorkflowStep[] = [
            {
                id: `${id}-1`,
                type: WorkflowStepType.Review,
                name: 'Initial Review',
                description: 'Review document for completeness and accuracy',
                assignee: 'legal.reviewer@example.com',
                status: WorkflowStepStatus.Pending
            },
            {
                id: `${id}-2`,
                type: WorkflowStepType.Approval,
                name: 'Legal Approval',
                description: 'Legal department approval',
                assignee: 'legal.head@example.com',
                status: WorkflowStepStatus.Pending
            },
            {
                id: `${id}-3`,
                type: WorkflowStepType.Signature,
                name: 'Executive Signature',
                description: 'Get executive signature',
                assignee: 'executive@example.com',
                status: WorkflowStepStatus.Pending
            }
        ];
        
        return {
            id,
            documentId,
            name: `${template} Workflow`,
            description: `Standard workflow for ${template}`,
            steps,
            currentStep: 0,
            status: WorkflowStepStatus.Pending,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString()
        };
    }
    
    private updateWorkflowStatus(workflow: Workflow): void {
        // Update workflow status based on step statuses
        const stepStatuses = workflow.steps.map(s => s.status);
        
        if (stepStatuses.every(s => s === WorkflowStepStatus.Completed)) {
            workflow.status = WorkflowStepStatus.Completed;
        } else if (stepStatuses.some(s => s === WorkflowStepStatus.Rejected)) {
            workflow.status = WorkflowStepStatus.Rejected;
        } else if (stepStatuses.some(s => s === WorkflowStepStatus.InProgress)) {
            workflow.status = WorkflowStepStatus.InProgress;
        } else if (stepStatuses.some(s => s === WorkflowStepStatus.Blocked)) {
            workflow.status = WorkflowStepStatus.Blocked;
        }
    }
    
    private handleDocumentCreated(document: { id: string }): void {
        // Automatically create a workflow for new documents
        this.createWorkflow(document.id, 'standard')
            .catch(err => {
                vscode.window.showErrorMessage(
                    `Failed to create workflow for document ${document.id}: ${err.message}`
                );
            });
    }
    
    private handleDocumentStatusChanged(data: { 
        documentId: string; 
        newStatus: DocumentStatus 
    }): void {
        const workflow = this.getWorkflowForDocument(data.documentId);
        if (workflow) {
            if (data.newStatus === DocumentStatus.Approved) {
                // Mark all remaining steps as completed
                workflow.steps.forEach(step => {
                    if (step.status !== WorkflowStepStatus.Completed) {
                        step.status = WorkflowStepStatus.Completed;
                        step.completedAt = new Date().toISOString();
                    }
                });
                workflow.status = WorkflowStepStatus.Completed;
            } else if (data.newStatus === DocumentStatus.Rejected) {
                workflow.status = WorkflowStepStatus.Rejected;
            }
        }
    }
}
