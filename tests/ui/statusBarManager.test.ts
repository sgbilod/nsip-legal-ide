import * as vscode from 'vscode';
import { StatusBarManager } from '../../src/ui/statusBarManager';
import { Logger } from '../../src/core/logger';

// Mock VS Code API
jest.mock('vscode', () => ({
    window: {
        createStatusBarItem: jest.fn(() => ({
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }))
    },
    StatusBarAlignment: {
        Left: 1,
        Right: 2
    }
}), { virtual: true });

describe('StatusBarManager', () => {
    let statusBarManager: StatusBarManager;
    let mockLogger: any;
    let mockStatusBarItem: any;

    beforeEach(() => {
        // Create a mock logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        // Create a mock status bar item
        mockStatusBarItem = {
            text: '',
            tooltip: '',
            command: '',
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        };

        // Make createStatusBarItem return our mock
        (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(mockStatusBarItem);

        // Create a status bar manager with the mock logger
        statusBarManager = new StatusBarManager(mockLogger as Logger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('initialize should show status bar and log debug message', async () => {
        await statusBarManager.initialize();
        
        expect(mockStatusBarItem.show).toHaveBeenCalled();
        expect(mockStatusBarItem.text).toContain('NSIP Legal IDE Ready');
        expect(mockLogger.debug).toHaveBeenCalledWith('StatusBarManager initialized');
    });

    test('dispose should dispose status bar item and log debug message', () => {
        statusBarManager.dispose();
        
        expect(mockStatusBarItem.dispose).toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalledWith('StatusBarManager disposed');
    });

    test('showMessage should update status bar text and show it', () => {
        const message = 'Test message';
        const tooltip = 'Test tooltip';
        
        statusBarManager.showMessage(message, tooltip);
        
        expect(mockStatusBarItem.text).toContain(message);
        expect(mockStatusBarItem.tooltip).toBe(tooltip);
        expect(mockStatusBarItem.show).toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalledWith(`Status bar message: ${message}`);
    });

    test('showMessage should use default tooltip if not provided', () => {
        const message = 'Test message';
        
        statusBarManager.showMessage(message);
        
        expect(mockStatusBarItem.tooltip).toBe('NSIP Legal IDE');
    });

    test('showComplianceStatus should update status bar with formatted score', () => {
        const score = 0.85;
        const tooltip = 'Test compliance tooltip';
        
        statusBarManager.showComplianceStatus(score, tooltip);
        
        // Should format score as percentage
        expect(mockStatusBarItem.text).toContain('85%');
        expect(mockStatusBarItem.tooltip).toBe(tooltip);
        expect(mockStatusBarItem.show).toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalledWith('Status bar compliance update: 85%');
    });

    test('showComplianceStatus should use different icons based on score', () => {
        // High score (≥ 90%)
        statusBarManager.showComplianceStatus(0.95);
        expect(mockStatusBarItem.text).toContain('$(check)');
        
        // Medium score (≥ 70% and < 90%)
        statusBarManager.showComplianceStatus(0.75);
        expect(mockStatusBarItem.text).toContain('$(warning)');
        
        // Low score (< 70%)
        statusBarManager.showComplianceStatus(0.65);
        expect(mockStatusBarItem.text).toContain('$(error)');
    });

    test('showComplianceStatus should use default tooltip if not provided', () => {
        const score = 0.85;
        
        statusBarManager.showComplianceStatus(score);
        
        expect(mockStatusBarItem.tooltip).toBe('Document compliance score: 85%');
    });

    test('hide should hide the status bar item', () => {
        statusBarManager.hide();
        
        expect(mockStatusBarItem.hide).toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalledWith('Status bar hidden');
    });
});
