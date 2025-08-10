import { IService, IEventEmitter } from '../core/interfaces';
/**
 * Workflow step type
 */
export declare enum WorkflowStepType {
    Review = "review",
    Approval = "approval",
    Signature = "signature",
    Distribution = "distribution",
    Custom = "custom"
}
/**
 * Workflow step status
 */
export declare enum WorkflowStepStatus {
    Pending = "pending",
    InProgress = "in-progress",
    Completed = "completed",
    Rejected = "rejected",
    Blocked = "blocked"
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
export declare class WorkflowManager implements IService {
    private eventBus;
    private workflows;
    constructor(eventBus: IEventEmitter);
    initialize(): Promise<void>;
    dispose(): Promise<void>;
    /**
     * Create a new workflow for a document
     */
    createWorkflow(documentId: string, template: string): Promise<Workflow>;
    /**
     * Get workflow by ID
     */
    getWorkflow(id: string): Workflow | undefined;
    /**
     * Get workflow for a document
     */
    getWorkflowForDocument(documentId: string): Workflow | undefined;
    /**
     * Update workflow step status
     */
    updateStepStatus(workflowId: string, stepId: string, status: WorkflowStepStatus, comment?: string): Promise<void>;
    /**
     * Move to next workflow step
     */
    moveToNextStep(workflowId: string): Promise<void>;
    private generateWorkflow;
    private updateWorkflowStatus;
    private handleDocumentCreated;
    private handleDocumentStatusChanged;
}
