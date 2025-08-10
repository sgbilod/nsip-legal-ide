import * as vscode from 'vscode';
import { TemplateComplianceValidator } from '../../src/templates/templateComplianceValidator';
import { TemplateEngine } from '../../src/templates/templateEngine';
import { ComplianceEngine } from '../../src/compliance/complianceEngine';
import { Logger } from '../../src/core/logger';
import { LegalDocument } from '../../src/ml/interfaces';

// Mock dependencies
jest.mock('vscode');
jest.mock('../../src/templates/templateEngine');
jest.mock('../../src/compliance/complianceEngine');
jest.mock('../../src/core/logger');

describe('TemplateComplianceValidator', () => {
    let templateComplianceValidator: TemplateComplianceValidator;
    let mockTemplateEngine: jest.Mocked<TemplateEngine>;
    let mockComplianceEngine: jest.Mocked<ComplianceEngine>;
    let mockLogger: jest.Mocked<Logger>;
    let originalRenderTemplate: jest.Mock;
    
    // Sample document and context
    const sampleContext = {
        title: 'Test Agreement',
        organization: {
            name: 'Test Organization',
            jurisdictions: ['US', 'EU'],
            regulatoryFrameworks: ['GDPR', 'CCPA']
        },
        authors: ['John Doe']
    };
    
    const renderedContent = '<h1>Test Agreement</h1><p>This is a test agreement.</p>';
    
    beforeEach(() => {
        // Set up mocks
        mockTemplateEngine = {
            initialize: jest.fn().mockResolvedValue(undefined),
            dispose: jest.fn(),
            renderTemplate: jest.fn().mockReturnValue(renderedContent),
            createTemplate: jest.fn(),
            updateTemplate: jest.fn(),
            deleteTemplate: jest.fn(),
            getTemplate: jest.fn(),
            getAllTemplates: jest.fn(),
            getTemplatesByCategory: jest.fn()
        } as unknown as jest.Mocked<TemplateEngine>;
        
        originalRenderTemplate = mockTemplateEngine.renderTemplate as jest.Mock;
        
        mockComplianceEngine = {
            initialize: jest.fn().mockResolvedValue(undefined),
            dispose: jest.fn(),
            validateDocument: jest.fn().mockReturnValue({
                isCompliant: true,
                score: 0.95,
                issues: [],
                recommendations: [],
                riskAreas: []
            }),
            getDiagnostics: jest.fn(),
            registerRule: jest.fn(),
            registerRules: jest.fn(),
            unregisterRule: jest.fn(),
            getAllRules: jest.fn(),
            getRulesByFramework: jest.fn(),
            generateComplianceReport: jest.fn(),
            getQuickFixes: jest.fn()
        } as unknown as jest.Mocked<ComplianceEngine>;
        
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            initialize: jest.fn().mockResolvedValue(undefined),
            dispose: jest.fn()
        } as unknown as jest.Mocked<Logger>;
        
        // Mock vscode APIs
        (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);
        (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);
        (vscode.window.createWebviewPanel as jest.Mock).mockReturnValue({
            webview: {
                html: ''
            },
            dispose: jest.fn()
        });
        
        // Create the validator
        templateComplianceValidator = new TemplateComplianceValidator(
            mockTemplateEngine,
            mockComplianceEngine,
            mockLogger
        );
    });
    
    describe('initialization', () => {
        it('should initialize without errors', async () => {
            await expect(templateComplianceValidator.initialize()).resolves.toBeUndefined();
            expect(mockLogger.info).toHaveBeenCalledWith('Initializing TemplateComplianceValidator');
            expect(mockLogger.info).toHaveBeenCalledWith('TemplateComplianceValidator initialized successfully');
        });
        
        it('should override the template engine renderTemplate method', async () => {
            await templateComplianceValidator.initialize();
            
            // The original method should be wrapped
            expect(mockTemplateEngine.renderTemplate).not.toBe(originalRenderTemplate);
            
            // Call the wrapped method
            const result = mockTemplateEngine.renderTemplate('test-template', sampleContext);
            
            // Should still return the original result
            expect(result).toBe(renderedContent);
            
            // Original method should have been called
            expect(originalRenderTemplate).toHaveBeenCalledWith('test-template', sampleContext);
        });
        
        it('should not initialize twice', async () => {
            await templateComplianceValidator.initialize();
            
            // Reset mocks to check second call
            mockLogger.info.mockClear();
            
            await templateComplianceValidator.initialize();
            
            // Should not log initialization again
            expect(mockLogger.info).not.toHaveBeenCalledWith('Initializing TemplateComplianceValidator');
        });
    });
    
    describe('validation', () => {
        beforeEach(async () => {
            await templateComplianceValidator.initialize();
        });
        
        it('should validate rendered content', async () => {
            // Call renderTemplate to trigger validation
            mockTemplateEngine.renderTemplate('test-template', sampleContext);
            
            // Allow async validation to complete
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Should have called validateDocument with a LegalDocument containing the rendered content
            expect(mockComplianceEngine.validateDocument).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: renderedContent,
                    title: sampleContext.title,
                    authors: sampleContext.authors,
                    status: 'draft'
                }),
                expect.anything()
            );
            
            // Logger should have been called
            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Validating compliance'));
            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Compliance validation completed'));
        });
        
        it('should handle compliance issues and show notification', async () => {
            // Mock validation result with issues
            const validationResult = {
                isCompliant: false,
                score: 0.7,
                issues: [
                    {
                        id: 'test-issue-1',
                        severity: 'error',
                        message: 'Test error issue'
                    },
                    {
                        id: 'test-issue-2',
                        severity: 'warning',
                        message: 'Test warning issue'
                    }
                ],
                recommendations: [],
                riskAreas: []
            };
            
            (mockComplianceEngine.validateDocument as jest.Mock).mockReturnValue(validationResult);
            
            // Call renderTemplate to trigger validation
            mockTemplateEngine.renderTemplate('test-template', sampleContext);
            
            // Allow async validation to complete
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Should show warning message for error issues
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
                expect.stringContaining('Compliance issues'),
                'View Issues'
            );
        });
        
        it('should handle validation errors gracefully', async () => {
            // Mock validation throwing an error
            (mockComplianceEngine.validateDocument as jest.Mock).mockImplementation(() => {
                throw new Error('Test validation error');
            });
            
            // Call renderTemplate to trigger validation
            mockTemplateEngine.renderTemplate('test-template', sampleContext);
            
            // Allow async validation to complete
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Should log the error
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('Error validating compliance'),
                expect.any(Error)
            );
        });
    });
    
    describe('organization extraction', () => {
        it('should create an organization from context', async () => {
            await templateComplianceValidator.initialize();
            
            // Context with organization info
            const contextWithOrg = {
                title: 'Test Document',
                organization: {
                    id: 'org-123',
                    name: 'Test Org',
                    type: 'corporation',
                    industry: ['legal', 'technology'],
                    size: 500,
                    jurisdictions: ['US', 'UK', 'EU'],
                    regulatoryFrameworks: ['GDPR', 'CCPA', 'HIPAA'],
                    subsidiaries: ['Subsidiary 1', 'Subsidiary 2'],
                    publiclyTraded: true,
                    riskProfile: 'high'
                }
            };
            
            // Call renderTemplate to trigger validation
            mockTemplateEngine.renderTemplate('test-template', contextWithOrg);
            
            // Allow async validation to complete
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Check that validateDocument was called with the right organization info
            expect(mockComplianceEngine.validateDocument).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    organization: expect.objectContaining({
                        id: 'org-123',
                        name: 'Test Org',
                        type: 'corporation',
                        industry: ['legal', 'technology'],
                        size: 500,
                        jurisdictions: ['US', 'UK', 'EU'],
                        regulatoryFrameworks: ['GDPR', 'CCPA', 'HIPAA'],
                        publiclyTraded: true,
                        riskProfile: 'high'
                    })
                })
            );
        });
        
        it('should handle minimal context and provide defaults', async () => {
            await templateComplianceValidator.initialize();
            
            // Minimal context
            const minimalContext = {
                title: 'Test Document'
            };
            
            // Call renderTemplate to trigger validation
            mockTemplateEngine.renderTemplate('test-template', minimalContext);
            
            // Allow async validation to complete
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Check that validateDocument was called with default organization info
            expect(mockComplianceEngine.validateDocument).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    organization: expect.objectContaining({
                        name: 'Default Organization',
                        jurisdictions: ['US'],
                        industry: ['technology'],
                        riskProfile: 'medium'
                    })
                })
            );
        });
    });
    
    describe('document type detection', () => {
        it('should detect document type from context and title', async () => {
            await templateComplianceValidator.initialize();
            
            // Test different document type scenarios
            const testCases = [
                { title: 'Service Agreement', expectedType: 'agreement' },
                { title: 'Employment Contract', expectedType: 'contract' },
                { title: 'Privacy Policy', expectedType: 'policy' },
                { title: 'Non-Disclosure Agreement', expectedType: 'agreement' },
                { title: 'Terms and Conditions', expectedType: 'agreement' },
                { title: 'Generic Document', documentType: 'specific-type', expectedType: 'specific-type' }
            ];
            
            for (const testCase of testCases) {
                mockComplianceEngine.validateDocument.mockClear();
                
                // Create context
                const context = {
                    title: testCase.title,
                    documentType: testCase.documentType
                };
                
                // Call renderTemplate to trigger validation
                mockTemplateEngine.renderTemplate('test-template', context);
                
                // Allow async validation to complete
                await new Promise(resolve => setTimeout(resolve, 0));
                
                // Check document type
                expect(mockComplianceEngine.validateDocument).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: testCase.expectedType
                    }),
                    expect.anything()
                );
            }
        });
    });
    
    describe('disposal', () => {
        it('should dispose resources properly', async () => {
            await templateComplianceValidator.initialize();
            
            templateComplianceValidator.dispose();
            
            expect(mockLogger.info).toHaveBeenCalledWith('Disposing TemplateComplianceValidator');
        });
    });
});
