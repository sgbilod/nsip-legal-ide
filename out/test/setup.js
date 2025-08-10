"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
// Mock VS Code API
globals_1.jest.mock('vscode', () => ({
    window: {
        showInformationMessage: globals_1.jest.fn(),
        showErrorMessage: globals_1.jest.fn(),
        createOutputChannel: globals_1.jest.fn().mockReturnValue({
            appendLine: globals_1.jest.fn(),
            show: globals_1.jest.fn(),
        }),
    },
    workspace: {
        getConfiguration: globals_1.jest.fn().mockReturnValue({
            get: globals_1.jest.fn(),
            update: globals_1.jest.fn(),
        }),
    },
    commands: {
        registerCommand: globals_1.jest.fn(),
    },
    EventEmitter: globals_1.jest.fn().mockImplementation(() => ({
        fire: globals_1.jest.fn(),
        event: globals_1.jest.fn(),
    })),
}), { virtual: true });
// Global test setup
beforeAll(() => {
    // Setup any global test requirements
});
afterAll(() => {
    // Cleanup after all tests
});
beforeEach(() => {
    // Reset all mocks before each test
    globals_1.jest.clearAllMocks();
});
//# sourceMappingURL=setup.js.map