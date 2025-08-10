import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TemplateEngine, Template, ValidationError } from '../../src/templates/templateEngine';

// Mock dependencies
jest.mock('vscode');
jest.mock('fs');
jest.mock('path');

describe('TemplateEngine', () => {
  let templateEngine: TemplateEngine;
  let mockContext: vscode.ExtensionContext;
  let mockWorkspace: typeof vscode.workspace;
  
  // Mock template content
  const templateContent = `
    <h1>{{title}}</h1>
    <p>{{content}}</p>
    {{#if includeSignature}}
    <div class="signature">
      {{signature}}
    </div>
    {{/if}}
  `;
  
  // Mock schema
  const templateSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
      includeSignature: { type: 'boolean' },
      signature: { type: 'string' }
    },
    required: ['title', 'content']
  };
  
  beforeEach(() => {
    // Mock file system operations
    (fs.existsSync as jest.Mock).mockImplementation((path) => {
      return path.endsWith('.schema.json');
    });
    
    (fs.readFile as jest.Mock).mockImplementation((path, encoding, callback) => {
      if (path.endsWith('.hbs')) {
        callback(null, templateContent);
      } else if (path.endsWith('.schema.json')) {
        callback(null, JSON.stringify(templateSchema));
      } else {
        callback(new Error('File not found'), null);
      }
    });
    
    // Mock readdir
    (fs.readdir as jest.Mock).mockImplementation((path, options, callback) => {
      if (path.includes('templates')) {
        callback(null, [
          { name: 'contracts', isDirectory: () => true, isFile: () => false },
          { name: 'agreements', isDirectory: () => true, isFile: () => false }
        ]);
      } else if (path.includes('contracts')) {
        callback(null, [
          { name: 'simple.hbs', isDirectory: () => false, isFile: () => true },
          { name: 'complex.hbs', isDirectory: () => false, isFile: () => true }
        ]);
      } else {
        callback(null, []);
      }
    });
    
    // Mock workspace
    mockWorkspace = {
      ...vscode.workspace,
      getConfiguration: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation((key, defaultValue) => {
          if (key === 'templates.repository') {
            return './templates';
          }
          return defaultValue;
        })
      }),
      workspaceFolders: [
        {
          uri: { fsPath: '/workspace' },
          name: 'workspace',
          index: 0
        }
      ]
    };
    (vscode.workspace as any) = mockWorkspace;
    
    // Set up path mock
    (path.join as jest.Mock).mockImplementation((...segments) => segments.join('/'));
    (path.isAbsolute as jest.Mock).mockImplementation((p) => p.startsWith('/'));
    (path.parse as jest.Mock).mockImplementation((p) => ({
      dir: p.substring(0, p.lastIndexOf('/')),
      base: p.substring(p.lastIndexOf('/') + 1),
      name: p.substring(p.lastIndexOf('/') + 1).split('.')[0],
      ext: '.' + p.split('.').pop(),
      root: '/'
    }));
    
    // Initialize the template engine
    templateEngine = new TemplateEngine();
  });
  
  describe('initialize', () => {
    it('should initialize without errors', async () => {
      // Mock mkdir for initialization
      (fs.mkdir as jest.Mock).mockImplementation((path, options, callback) => {
        callback(null);
      });
      
      await expect(templateEngine.initialize()).resolves.toBeUndefined();
    });
    
    it('should handle error if template directory creation fails', async () => {
      // Mock mkdir to fail
      (fs.mkdir as jest.Mock).mockImplementation((path, options, callback) => {
        callback({ code: 'EACCES', message: 'Permission denied' });
      });
      
      await expect(templateEngine.initialize()).rejects.toThrow();
    });
  });
  
  describe('renderTemplate', () => {
    beforeEach(async () => {
      // Mock successful initialization
      (fs.mkdir as jest.Mock).mockImplementation((path, options, callback) => {
        callback({ code: 'EEXIST' });
      });
      
      // Mock promisify
      jest.spyOn(require('util'), 'promisify').mockImplementation((fn) => {
        return (...args: any[]) => {
          return new Promise((resolve, reject) => {
            fn(...args, (err: any, result: any) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        };
      });
      
      // Initialize the template engine
      try {
        await templateEngine.initialize();
      } catch (e) {
        console.error('Initialization failed:', e);
      }
      
      // Mock the template maps
      (templateEngine as any).templates = new Map([
        ['contracts/simple', {
          id: 'contracts/simple',
          path: '/workspace/templates/contracts/simple.hbs',
          schema: templateSchema,
          content: templateContent
        }]
      ]);
      
      (templateEngine as any).compiledTemplates = new Map([
        ['contracts/simple', require('handlebars').compile(templateContent)]
      ]);
    });
    
    it('should render a template with valid context', () => {
      const context = {
        title: 'Test Template',
        content: 'This is a test template content.',
        includeSignature: true,
        signature: 'John Doe'
      };
      
      const rendered = templateEngine.renderTemplate('contracts/simple', context);
      
      expect(rendered).toContain('Test Template');
      expect(rendered).toContain('This is a test template content.');
      expect(rendered).toContain('John Doe');
    });
    
    it('should throw validation error with invalid context', () => {
      const context = {
        // Missing required 'title' field
        content: 'This is a test template content.'
      };
      
      expect(() => {
        templateEngine.renderTemplate('contracts/simple', context);
      }).toThrow(ValidationError);
    });
    
    it('should throw error when template not found', () => {
      const context = {
        title: 'Test Template',
        content: 'This is a test template content.'
      };
      
      expect(() => {
        templateEngine.renderTemplate('non-existent', context);
      }).toThrow('Template non-existent not found');
    });
  });
  
  describe('template management', () => {
    beforeEach(async () => {
      // Mock successful initialization
      (fs.mkdir as jest.Mock).mockImplementation((path, options, callback) => {
        callback(null);
      });
      
      // Mock writeFile
      (fs.writeFile as jest.Mock).mockImplementation((path, content, encoding, callback) => {
        callback(null);
      });
      
      // Mock unlink
      (fs.unlink as jest.Mock).mockImplementation((path, callback) => {
        callback(null);
      });
      
      // Initialize the template engine
      await templateEngine.initialize();
      
      // Set up the template maps
      (templateEngine as any).templates = new Map([
        ['contracts/existing', {
          id: 'contracts/existing',
          path: '/workspace/templates/contracts/existing.hbs',
          schema: templateSchema,
          content: templateContent
        }]
      ]);
      
      (templateEngine as any).compiledTemplates = new Map([
        ['contracts/existing', require('handlebars').compile(templateContent)]
      ]);
    });
    
    it('should create a new template', async () => {
      await expect(templateEngine.createTemplate(
        'contracts',
        'new-template',
        'Template content',
        { type: 'object' }
      )).resolves.toBe('contracts/new-template');
    });
    
    it('should update an existing template', async () => {
      await expect(templateEngine.updateTemplate(
        'contracts/existing',
        'Updated content',
        { type: 'object' }
      )).resolves.toBeUndefined();
    });
    
    it('should throw when updating non-existent template', async () => {
      await expect(templateEngine.updateTemplate(
        'non-existent',
        'Content',
        {}
      )).rejects.toThrow('Template non-existent not found');
    });
    
    it('should delete an existing template', async () => {
      await expect(templateEngine.deleteTemplate('contracts/existing')).resolves.toBeUndefined();
      expect((templateEngine as any).templates.has('contracts/existing')).toBe(false);
    });
    
    it('should throw when deleting non-existent template', async () => {
      await expect(templateEngine.deleteTemplate('non-existent')).rejects.toThrow('Template non-existent not found');
    });
  });
  
  describe('helpers', () => {
    it('should register custom handlebars helpers', () => {
      // Get the list of registered helpers
      const helpers = Object.keys(require('handlebars').helpers);
      
      // Check for our custom helpers
      expect(helpers).toContain('eq');
      expect(helpers).toContain('ne');
      expect(helpers).toContain('uppercase');
      expect(helpers).toContain('lowercase');
      expect(helpers).toContain('capitalize');
    });
  });
});
