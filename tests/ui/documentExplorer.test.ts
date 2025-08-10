import * as vscode from 'vscode';
import * as fs from 'fs';
import { DocumentExplorer } from '../../src/ui/documentExplorer';
import { Logger } from '../../src/core/logger';

// Mock VS Code API
jest.mock('vscode', () => ({
    window: {
        createTreeView: jest.fn(() => ({
            dispose: jest.fn()
        })),
    },
    workspace: {
        workspaceFolders: [
            { uri: { fsPath: '/path/to/workspace' } }
        ],
        onDidChangeWorkspaceFolders: jest.fn(callback => {
            // Store the callback for later use in tests
            (global as any).workspaceFoldersCallback = callback;
            return { dispose: jest.fn() };
        })
    },
    EventEmitter: jest.fn(() => ({
        event: 'mockEvent',
        fire: jest.fn()
    })),
    Uri: {
        file: jest.fn(path => ({ fsPath: path }))
    },
    ThemeIcon: jest.fn(),
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
    }
}), { virtual: true });

// Mock fs module
jest.mock('fs', () => ({
    readdirSync: jest.fn(),
}));

describe('DocumentExplorer', () => {
    let documentExplorer: DocumentExplorer;
    let mockLogger: any;

    beforeEach(() => {
        // Create a mock logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };

        // Create a document explorer with the mock logger
        documentExplorer = new DocumentExplorer(mockLogger as Logger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('initialize should create tree view, add workspace folders, and log debug message', async () => {
        await documentExplorer.initialize();
        
        expect(vscode.window.createTreeView).toHaveBeenCalledWith(
            'nsipDocumentExplorer',
            expect.any(Object)
        );
        expect(vscode.workspace.onDidChangeWorkspaceFolders).toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalledWith('DocumentExplorer initialized');
    });

    test('dispose should dispose tree view and log debug message', () => {
        // First initialize to create tree view
        documentExplorer.initialize();
        
        // Then dispose
        documentExplorer.dispose();
        
        // Debug message should have been logged
        expect(mockLogger.debug).toHaveBeenCalledWith('DocumentExplorer disposed');
    });

    test('refresh should refresh the tree data provider', () => {
        // Initialize and create a spy on the refresh method
        documentExplorer.initialize();
        const refreshSpy = jest.spyOn(documentExplorer, 'refresh');
        
        // Call refresh
        documentExplorer.refresh();
        
        // Verify refresh was called
        expect(refreshSpy).toHaveBeenCalled();
    });

    test('addWorkspaceFolder should add folder and refresh if not already added', () => {
        // Initialize first
        documentExplorer.initialize();
        
        // Create a spy on the refresh method
        const refreshSpy = jest.spyOn(documentExplorer, 'refresh');
        
        // Add a new workspace folder
        const folderUri = vscode.Uri.file('/path/to/new/workspace');
        documentExplorer.addWorkspaceFolder(folderUri);
        
        // Verify refresh was called
        expect(refreshSpy).toHaveBeenCalled();
        
        // Add the same folder again
        refreshSpy.mockClear();
        documentExplorer.addWorkspaceFolder(folderUri);
        
        // Verify refresh was not called the second time
        expect(refreshSpy).not.toHaveBeenCalled();
    });

    test('removeWorkspaceFolder should remove folder and refresh', () => {
        // Initialize first
        documentExplorer.initialize();
        
        // Add a workspace folder
        const folderUri = vscode.Uri.file('/path/to/workspace');
        documentExplorer.addWorkspaceFolder(folderUri);
        
        // Create a spy on the refresh method
        const refreshSpy = jest.spyOn(documentExplorer, 'refresh');
        
        // Remove the workspace folder
        documentExplorer.removeWorkspaceFolder(folderUri);
        
        // Verify refresh was called
        expect(refreshSpy).toHaveBeenCalled();
    });

    test('workspace folder change event should add/remove folders', async () => {
        // Initialize to set up the event listener
        await documentExplorer.initialize();
        
        // Create spies on the add/remove methods
        const addSpy = jest.spyOn(documentExplorer, 'addWorkspaceFolder');
        const removeSpy = jest.spyOn(documentExplorer, 'removeWorkspaceFolder');
        
        // Get the callback that was registered
        const callback = (global as any).workspaceFoldersCallback;
        
        // Simulate a workspace folder change event
        callback({
            added: [{ uri: vscode.Uri.file('/path/to/added/workspace') }],
            removed: [{ uri: vscode.Uri.file('/path/to/removed/workspace') }]
        });
        
        // Verify methods were called
        expect(addSpy).toHaveBeenCalledWith(vscode.Uri.file('/path/to/added/workspace'));
        expect(removeSpy).toHaveBeenCalledWith(vscode.Uri.file('/path/to/removed/workspace'));
    });
});
