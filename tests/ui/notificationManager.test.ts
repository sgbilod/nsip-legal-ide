import * as vscode from 'vscode';
import { NotificationManager } from '../../src/ui/notificationManager';
import { Logger } from '../../src/core/logger';

// Mock VS Code API
jest.mock('vscode', () => ({
    window: {
        showInformationMessage: jest.fn().mockResolvedValue(undefined),
        showWarningMessage: jest.fn().mockResolvedValue(undefined),
        showErrorMessage: jest.fn().mockResolvedValue(undefined),
    },
}), { virtual: true });

describe('NotificationManager', () => {
    let notificationManager: NotificationManager;
    let mockLogger: any;

    beforeEach(() => {
        // Create a mock logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        // Create a notification manager with the mock logger
        notificationManager = new NotificationManager(mockLogger as Logger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('initialize should log debug message', async () => {
        await notificationManager.initialize();
        expect(mockLogger.debug).toHaveBeenCalledWith('NotificationManager initialized');
    });

    test('dispose should log debug message', () => {
        notificationManager.dispose();
        expect(mockLogger.debug).toHaveBeenCalledWith('NotificationManager disposed');
    });

    test('showInformation should call VS Code API and log message', async () => {
        const message = 'Test information message';
        const options = ['Option 1', 'Option 2'];

        await notificationManager.showInformation(message, ...options);

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(message, ...options);
        expect(mockLogger.info).toHaveBeenCalledWith(`Showing info: ${message}`);
    });

    test('showWarning should call VS Code API and log message', async () => {
        const message = 'Test warning message';
        const options = ['Option 1', 'Option 2'];

        await notificationManager.showWarning(message, ...options);

        expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(message, ...options);
        expect(mockLogger.warn).toHaveBeenCalledWith(`Showing warning: ${message}`);
    });

    test('showError should call VS Code API and log message', async () => {
        const message = 'Test error message';
        const options = ['Option 1', 'Option 2'];

        await notificationManager.showError(message, ...options);

        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(message, ...options);
        expect(mockLogger.error).toHaveBeenCalledWith(`Showing error: ${message}`);
    });

    test('withProgress should call VS Code API and log message', async () => {
        // Mock the withProgress function
        (vscode.window as any).withProgress = jest.fn().mockImplementation((options, task) => {
            return task({ report: jest.fn() });
        });

        const title = 'Test progress';
        const task = jest.fn().mockResolvedValue('result');

        const result = await notificationManager.withProgress(title, task);

        expect(vscode.window.withProgress).toHaveBeenCalled();
        expect(task).toHaveBeenCalled();
        expect(result).toBe('result');
        expect(mockLogger.debug).toHaveBeenCalledWith(`Starting progress: ${title}`);
    });
});
