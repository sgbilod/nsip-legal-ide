"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const workflowManager_1 = require("../services/workflowManager");
const eventBus_1 = require("../core/eventBus");
const globals_1 = require("@jest/globals");
describe('WorkflowManager', () => {
    let workflowManager;
    let eventBus;
    beforeEach(() => {
        eventBus = new eventBus_1.EventBus();
        workflowManager = new workflowManager_1.WorkflowManager(eventBus);
    });
    it('should initialize without errors', async () => {
        await (0, globals_1.expect)(workflowManager.initialize()).resolves.not.toThrow();
    });
    it('should create a workflow', async () => {
        const workflow = await workflowManager.createWorkflow('doc123', 'standard');
        (0, globals_1.expect)(workflow).toBeDefined();
        (0, globals_1.expect)(workflow.documentId).toBe('doc123');
    });
    it('should update step status', async () => {
        const workflow = await workflowManager.createWorkflow('doc123', 'standard');
        const stepId = workflow.steps[0].id;
        await (0, globals_1.expect)(workflowManager.updateStepStatus(workflow.id, stepId, 'completed')).resolves.not.toThrow();
    });
});
//# sourceMappingURL=sample.test.js.map