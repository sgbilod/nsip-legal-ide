import { WorkflowManager } from '../services/workflowManager';
import { EventBus } from '../core/eventBus';
import { expect } from '@jest/globals';

describe('WorkflowManager Coverage Tests', () => {
    let workflowManager: WorkflowManager;
    let eventBus: EventBus;

    beforeEach(() => {
        eventBus = new EventBus();
        workflowManager = new WorkflowManager(eventBus);
    });

    it('should handle document creation events', async () => {
        const mockDocument = { id: 'doc123' };
        eventBus.emit('document.created', mockDocument);
        const workflow = workflowManager.getWorkflowForDocument(mockDocument.id);
        expect(workflow).toBeDefined();
        expect(workflow?.documentId).toBe(mockDocument.id);
    });

    it('should handle document status change events', async () => {
        const mockDocument = { id: 'doc123' };
        const workflow = await workflowManager.createWorkflow(mockDocument.id, 'standard');
        eventBus.emit('document.statusChanged', {
            documentId: mockDocument.id,
            newStatus: 'approved'
        });
        expect(workflow.status).toBe('completed');
    });
});
