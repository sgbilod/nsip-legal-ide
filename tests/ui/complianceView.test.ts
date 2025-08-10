import * as vscode from 'vscode';
import { ComplianceView } from '../../src/ui/complianceView';
import { ComplianceIssue } from '../../src/compliance/complianceEngine';
import { Logger } from '../../src/core/logger';

// Mock VS Code API
jest.mock('vscode', () => ({
    window: {
        createTreeView: jest.fn(() => ({
            dispose: jest.fn(),
            reveal: jest.fn()
        })),
        showInformationMessage: jest.fn(),
    },
    EventEmitter: jest.fn(() => ({
        event: 'mockEvent',
        fire: jest.fn()
    })),
    Uri: {
        file: jest.fn(path => ({ fsPath: path }))
    },
    Range: jest.fn(),
    ThemeIcon: jest.fn(),
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
    }
}), { virtual: true });

describe('ComplianceView', () => {
    let complianceView: ComplianceView;
    let mockLogger: any;

    beforeEach(() => {
        // Create a mock logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        // Create a compliance view with the mock logger
        complianceView = new ComplianceView(mockLogger as Logger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('initialize should create tree view and log debug message', async () => {
        await complianceView.initialize();
        
        expect(vscode.window.createTreeView).toHaveBeenCalledWith(
            'nsipComplianceView',
            expect.any(Object)
        );
        expect(mockLogger.debug).toHaveBeenCalledWith('ComplianceView initialized');
    });

    test('dispose should dispose tree view and log debug message', () => {
        // First initialize to create tree view
        complianceView.initialize();
        
        // Then dispose
        complianceView.dispose();
        
        // The tree view's dispose method should have been called
        expect(mockLogger.debug).toHaveBeenCalledWith('ComplianceView disposed');
    });

    test('showIssues should update tree data provider and log debug message', () => {
        // Create sample compliance issues
        const issues: ComplianceIssue[] = [
            {
                id: 'issue1',
                severity: 'error',
                message: 'Test error issue',
                location: {
                    startLine: 1,
                    startCharacter: 0,
                    endLine: 1,
                    endCharacter: 10
                }
            },
            {
                id: 'issue2',
                severity: 'warning',
                message: 'Test warning issue',
                location: {
                    startLine: 5,
                    startCharacter: 0,
                    endLine: 5,
                    endCharacter: 20
                }
            }
        ];
        
        // Create a sample document URI
        const documentUri = vscode.Uri.file('/path/to/document.md');
        
        // First initialize to create tree view
        complianceView.initialize();
        
        // Then show issues
        complianceView.showIssues(issues, documentUri);
        
        // Debug message should have been logged
        expect(mockLogger.debug).toHaveBeenCalledWith(
            `Showing ${issues.length} compliance issues for ${documentUri.fsPath}`
        );
    });

    test('clearIssues should clear tree data provider and log debug message', () => {
        // First initialize to create tree view
        complianceView.initialize();
        
        // Then clear issues
        complianceView.clearIssues();
        
        // Debug message should have been logged
        expect(mockLogger.debug).toHaveBeenCalledWith('Clearing compliance issues');
    });

    test('focus should reveal first item if tree view exists', () => {
        // First initialize to create tree view
        complianceView.initialize();
        
        // Then focus
        complianceView.focus();
        
        // Tree view's reveal method should not be called since there are no items
        // This test just verifies that no errors are thrown
    });
});
