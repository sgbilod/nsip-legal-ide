import * as vscode from 'vscode';
import { DocumentIntelligenceProvider } from '../../src/providers/documentIntelligence';
import { ServiceRegistry } from '../../src/core/serviceRegistry';
import { Logger } from '../../src/core/logger';
import { IDocumentAnalysis } from '../../src/core/interfaces';

// Mock dependencies
jest.mock('../../src/core/serviceRegistry');
jest.mock('../../src/core/logger');

describe('DocumentIntelligenceProvider', () => {
  let provider: DocumentIntelligenceProvider;
  let mockContext: vscode.ExtensionContext;
  let mockLogger: jest.Mocked<Logger>;
  let mockRegistry: jest.Mocked<ServiceRegistry>;
  let mockDiagnosticCollection: jest.Mocked<vscode.DiagnosticCollection>;
  
  beforeEach(() => {
    // Set up mocks
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      initialize: jest.fn().mockResolvedValue(undefined),
      dispose: jest.fn()
    } as unknown as jest.Mocked<Logger>;
    
    mockDiagnosticCollection = {
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn()
    } as unknown as jest.Mocked<vscode.DiagnosticCollection>;
    
    mockRegistry = {
      get: jest.fn().mockImplementation((name: string) => {
        if (name === 'logger') return mockLogger;
        if (name === 'diagnostics') return mockDiagnosticCollection;
        return null;
      }),
      getInstance: jest.fn().mockReturnThis()
    } as unknown as jest.Mocked<ServiceRegistry>;
    
    (ServiceRegistry.getInstance as jest.Mock).mockReturnValue(mockRegistry);
    
    mockContext = {
      subscriptions: [],
      extensionPath: '/test',
      secrets: {
        get: jest.fn().mockResolvedValue(undefined),
        store: jest.fn().mockResolvedValue(undefined)
      }
    } as unknown as vscode.ExtensionContext;
    
    // Create provider
    provider = new DocumentIntelligenceProvider(mockContext);
  });
  
  describe('initialize', () => {
    it('should initialize without errors', async () => {
      await expect(provider.initialize()).resolves.toBeUndefined();
      expect(mockLogger.info).toHaveBeenCalledWith('Document intelligence provider initialized');
    });
  });
  
  describe('analyzeDocument', () => {
    it('should perform basic analysis when AI is not configured', async () => {
      // Mock document
      const mockDocument = {
        fileName: 'test.legal',
        getText: jest.fn().mockReturnValue('This document contains a liability clause.'),
        uri: { fsPath: '/test/test.legal' },
        positionAt: jest.fn().mockImplementation((index) => {
          return { line: 0, character: index };
        })
      } as unknown as vscode.TextDocument;
      
      const result = await provider.analyzeDocument(mockDocument);
      
      expect(result).toBeDefined();
      expect(result.clauses.length).toBeGreaterThan(0);
      expect(mockLogger.info).toHaveBeenCalledWith('Analyzing document: test.legal');
      expect(mockDiagnosticCollection.set).toHaveBeenCalled();
    });
  });
  
  describe('provideCompletionItems', () => {
    it('should provide completion items for legal terms', () => {
      // Mock document and position
      const mockDocument = {
        lineAt: jest.fn().mockReturnValue({
          text: 'This is a test document with lia'
        }),
        getText: jest.fn().mockReturnValue('This is a test document with liability')
      } as unknown as vscode.TextDocument;
      
      const position = new vscode.Position(0, 30);
      const token = {} as vscode.CancellationToken;
      const context = {} as vscode.CompletionContext;
      
      const result = provider.provideCompletionItems(mockDocument, position, token, context);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect((result as vscode.CompletionItem[]).length).toBeGreaterThan(0);
    });
  });
  
  describe('provideHover', () => {
    it('should provide hover information for legal terms', () => {
      // Mock document and position
      const mockDocument = {
        getWordRangeAtPosition: jest.fn().mockReturnValue(new vscode.Range(0, 5, 0, 14)),
        getText: jest.fn().mockImplementation((range) => 'liability')
      } as unknown as vscode.TextDocument;
      
      const position = new vscode.Position(0, 10);
      const token = {} as vscode.CancellationToken;
      
      const result = provider.provideHover(mockDocument, position, token);
      
      expect(result).toBeDefined();
      const hover = result as vscode.Hover;
      expect(hover.contents).toBeDefined();
    });
    
    it('should return null for non-legal terms', () => {
      // Mock document and position
      const mockDocument = {
        getWordRangeAtPosition: jest.fn().mockReturnValue(new vscode.Range(0, 5, 0, 14)),
        getText: jest.fn().mockImplementation((range) => 'nonlegal')
      } as unknown as vscode.TextDocument;
      
      const position = new vscode.Position(0, 10);
      const token = {} as vscode.CancellationToken;
      
      const result = provider.provideHover(mockDocument, position, token);
      
      expect(result).toBeNull();
    });
    
    it('should return null if no word range is found', () => {
      // Mock document and position
      const mockDocument = {
        getWordRangeAtPosition: jest.fn().mockReturnValue(null)
      } as unknown as vscode.TextDocument;
      
      const position = new vscode.Position(0, 10);
      const token = {} as vscode.CancellationToken;
      
      const result = provider.provideHover(mockDocument, position, token);
      
      expect(result).toBeNull();
    });
  });
  
  describe('dispose', () => {
    it('should dispose without errors', () => {
      expect(() => provider.dispose()).not.toThrow();
    });
  });
});
