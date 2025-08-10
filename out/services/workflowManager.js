"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowManager = exports.WorkflowStepStatus = exports.WorkflowStepType = void 0;
const legalDocumentManager_1 = require("./legalDocumentManager");
const vscode = __importStar(require("vscode"));
/**
 * Workflow step type
 */
var WorkflowStepType;
(function (WorkflowStepType) {
    WorkflowStepType["Review"] = "review";
    WorkflowStepType["Approval"] = "approval";
    WorkflowStepType["Signature"] = "signature";
    WorkflowStepType["Distribution"] = "distribution";
    WorkflowStepType["Custom"] = "custom";
})(WorkflowStepType || (exports.WorkflowStepType = WorkflowStepType = {}));
/**
 * Workflow step status
 */
var WorkflowStepStatus;
(function (WorkflowStepStatus) {
    WorkflowStepStatus["Pending"] = "pending";
    WorkflowStepStatus["InProgress"] = "in-progress";
    WorkflowStepStatus["Completed"] = "completed";
    WorkflowStepStatus["Rejected"] = "rejected";
    WorkflowStepStatus["Blocked"] = "blocked";
})(WorkflowStepStatus || (exports.WorkflowStepStatus = WorkflowStepStatus = {}));
/**
 * Service for managing document workflows
 */
class WorkflowManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.workflows = new Map();
    }
    async initialize() {
        // Subscribe to relevant events
        this.eventBus.on('document.created', this.handleDocumentCreated.bind(this));
        this.eventBus.on('document.statusChanged', this.handleDocumentStatusChanged.bind(this));
    }
    async dispose() {
        // Clear workflows
        this.workflows.clear();
    }
    /**
     * Create a new workflow for a document
     */
    async createWorkflow(documentId, template) {
        const workflow = await this.generateWorkflow(documentId, template);
        this.workflows.set(workflow.id, workflow);
        this.eventBus.emit('workflow.created', workflow);
        return workflow;
    }
    /**
     * Get workflow by ID
     */
    getWorkflow(id) {
        return this.workflows.get(id);
    }
    /**
     * Get workflow for a document
     */
    getWorkflowForDocument(documentId) {
        return Array.from(this.workflows.values()).find(w => w.documentId === documentId);
    }
    /**
     * Update workflow step status
     */
    async updateStepStatus(workflowId, stepId, status, comment) {
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
    async moveToNextStep(workflowId) {
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
    async generateWorkflow(documentId, template) {
        // Generate a unique ID
        const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        // In a real implementation, this would load steps from a template
        // For now, create some sample steps
        const steps = [
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
    updateWorkflowStatus(workflow) {
        // Update workflow status based on step statuses
        const stepStatuses = workflow.steps.map(s => s.status);
        if (stepStatuses.every(s => s === WorkflowStepStatus.Completed)) {
            workflow.status = WorkflowStepStatus.Completed;
        }
        else if (stepStatuses.some(s => s === WorkflowStepStatus.Rejected)) {
            workflow.status = WorkflowStepStatus.Rejected;
        }
        else if (stepStatuses.some(s => s === WorkflowStepStatus.InProgress)) {
            workflow.status = WorkflowStepStatus.InProgress;
        }
        else if (stepStatuses.some(s => s === WorkflowStepStatus.Blocked)) {
            workflow.status = WorkflowStepStatus.Blocked;
        }
    }
    handleDocumentCreated(document) {
        // Automatically create a workflow for new documents
        this.createWorkflow(document.id, 'standard')
            .catch(err => {
            vscode.window.showErrorMessage(`Failed to create workflow for document ${document.id}: ${err.message}`);
        });
    }
    handleDocumentStatusChanged(data) {
        const workflow = this.getWorkflowForDocument(data.documentId);
        if (workflow) {
            if (data.newStatus === legalDocumentManager_1.DocumentStatus.Approved) {
                // Mark all remaining steps as completed
                workflow.steps.forEach(step => {
                    if (step.status !== WorkflowStepStatus.Completed) {
                        step.status = WorkflowStepStatus.Completed;
                        step.completedAt = new Date().toISOString();
                    }
                });
                workflow.status = WorkflowStepStatus.Completed;
            }
            else if (data.newStatus === legalDocumentManager_1.DocumentStatus.Rejected) {
                workflow.status = WorkflowStepStatus.Rejected;
            }
        }
    }
}
exports.WorkflowManager = WorkflowManager;
//# sourceMappingURL=workflowManager.js.map