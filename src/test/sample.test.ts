import { WorkflowManager, WorkflowStepStatus } from '../services/workflowManager';
import { EventBus } from '../core/eventBus';
import { expect } from '@jest/globals';

describe('WorkflowManager', () => {
    let workflowManager: WorkflowManager;
    let eventBus: EventBus;

    beforeEach(() => {
        eventBus = new EventBus();
        workflowManager = new WorkflowManager(eventBus);
    });

    it('should initialize without errors', async () => {
        await expect(workflowManager.initialize()).resolves.not.toThrow();
    });

    it('should create a workflow', async () => {
        const workflow = await workflowManager.createWorkflow('doc123', 'standard');
        expect(workflow).toBeDefined();
        expect(workflow.documentId).toBe('doc123');
    });

    it('should update step status', async () => {
        const workflow = await workflowManager.createWorkflow('doc123', 'standard');
        const stepId = workflow.steps[0].id;
        await expect(
            workflowManager.updateStepStatus(workflow.id, stepId, WorkflowStepStatus.Completed)
        ).resolves.not.toThrow();
    });
});
