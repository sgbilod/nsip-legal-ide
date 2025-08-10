import * as vscode from 'vscode';

// Mock the VS Code API
jest.mock('vscode', () => {
  return {
    window: {
      showInformationMessage: jest.fn(),
      showErrorMessage: jest.fn(),
      showWarningMessage: jest.fn(),
      createOutputChannel: jest.fn(() => ({
        appendLine: jest.fn(),
        clear: jest.fn(),
        show: jest.fn(),
        dispose: jest.fn()
      })),
      createStatusBarItem: jest.fn(() => ({
        text: '',
        command: '',
        tooltip: '',
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
      })),
      showQuickPick: jest.fn(),
      showInputBox: jest.fn(),
      createWebviewPanel: jest.fn(() => ({
        webview: {
          html: '',
          onDidReceiveMessage: jest.fn(),
          postMessage: jest.fn(),
          asWebviewUri: jest.fn(uri => uri)
        },
        onDidDispose: jest.fn(),
        onDidChangeViewState: jest.fn(),
        reveal: jest.fn(),
        dispose: jest.fn()
      })),
      activeTextEditor: {
        document: {
          getText: jest.fn(),
          fileName: 'test.nsip',
          uri: { fsPath: '/test/test.nsip' }
        },
        selection: {
          active: { line: 0, character: 0 },
          anchor: { line: 0, character: 0 }
        },
        edit: jest.fn()
      }
    },
    workspace: {
      getConfiguration: jest.fn(() => ({
        get: jest.fn(),
        has: jest.fn(),
        update: jest.fn()
      })),
      workspaceFolders: [{ uri: { fsPath: '/test' } }],
      asRelativePath: jest.fn(path => path),
      createFileSystemWatcher: jest.fn(),
      onDidChangeConfiguration: jest.fn(),
      onDidOpenTextDocument: jest.fn(),
      onDidSaveTextDocument: jest.fn()
    },
    commands: {
      registerCommand: jest.fn(),
      executeCommand: jest.fn()
    },
    languages: {
      registerCompletionItemProvider: jest.fn(),
      registerHoverProvider: jest.fn(),
      createDiagnosticCollection: jest.fn(() => ({
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        dispose: jest.fn()
      }))
    },
    extensions: {
      getExtension: jest.fn()
    },
    Uri: {
      file: (path: string) => ({ fsPath: path, scheme: 'file' }),
      parse: jest.fn()
    },
    EventEmitter: jest.fn(() => ({
      event: jest.fn(),
      fire: jest.fn()
    })),
    Disposable: {
      from: jest.fn()
    },
    StatusBarAlignment: {
      Left: 1,
      Right: 2
    },
    Position: jest.fn((line, character) => ({ line, character })),
    Range: jest.fn((start, end) => ({ start, end })),
    CompletionItem: jest.fn((label, kind) => ({ label, kind })),
    CompletionItemKind: {
      Text: 0,
      Method: 1,
      Function: 2,
      Field: 3
    },
    DiagnosticSeverity: {
      Error: 0,
      Warning: 1,
      Information: 2,
      Hint: 3
    },
    Hover: jest.fn(contents => ({ contents })),
    MarkdownString: jest.fn(value => ({ value })),
    TreeItem: jest.fn(label => ({ label })),
    TreeItemCollapsibleState: {
      None: 0,
      Collapsed: 1,
      Expanded: 2
    }
  };
});

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
