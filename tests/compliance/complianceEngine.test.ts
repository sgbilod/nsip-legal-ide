import * as vscode from 'vscode';
import { ComplianceEngine, ComplianceIssue } from '../../src/compliance/complianceEngine';
import { LegalDocument, Organization } from '../../src/ml/interfaces';
import { IEventEmitter, ILogger } from '../../src/core/interfaces';

// Mock dependencies
jest.mock('vscode');

describe('ComplianceEngine', () => {
    let complianceEngine: ComplianceEngine;
    let mockEventBus: jest.Mocked<IEventEmitter>;
    let mockLogger: jest.Mocked<ILogger>;
    
    // Sample test data
    const sampleOrganization: Organization = {
        id: 'org-123',
        name: 'Test Organization',
        type: 'corporation',
        industry: ['technology'],
        size: 500,
        jurisdictions: ['US', 'EU'],
        regulatoryFrameworks: ['GDPR', 'CCPA'],
        subsidiaries: [],
        publiclyTraded: true,
        riskProfile: 'medium'
    };
    
    const sampleDocument: LegalDocument = {
        id: 'doc-123',
        title: 'Privacy Policy',
        content: 'This is a sample privacy policy document.',
        type: 'agreement',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        authors: ['John Doe'],
        status: 'draft'
    };
    
    // Setup mocks before each test
    beforeEach(() => {
        // Create mock event bus
        mockEventBus = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn()
        };
        
        // Create mock logger
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        };
        
        // Mock vscode.workspace configuration
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
            get: jest.fn().mockImplementation((key, defaultValue) => {
                if (key === 'validateOnSave') return true;
                if (key === 'validateRenderedTemplates') return true;
                return defaultValue;
            })
        });
        
        // Mock vscode Range, Diagnostic, CodeAction, etc.
        (vscode.Range as jest.Mock).mockImplementation((startLine, startChar, endLine, endChar) => ({
            start: { line: startLine, character: startChar },
            end: { line: endLine, character: endChar }
        }));
        
        (vscode.Diagnostic as jest.Mock).mockImplementation((range, message, severity) => ({
            range,
            message,
            severity,
            source: '',
            code: ''
        }));
        
        (vscode.CodeAction as jest.Mock).mockImplementation((title, kind) => ({
            title,
            kind,
            edit: null,
            command: null
        }));
        
        (vscode.WorkspaceEdit as jest.Mock).mockImplementation(() => ({
            replace: jest.fn()
        }));
        
        // Create compliance engine instance
        complianceEngine = new ComplianceEngine(mockEventBus, mockLogger);
    });
    
    describe('initialization', () => {
        it('should initialize without errors', async () => {
            await expect(complianceEngine.initialize()).resolves.toBeUndefined();
            expect(mockEventBus.on).toHaveBeenCalledWith('document.saved', expect.any(Function));
            expect(mockEventBus.on).toHaveBeenCalledWith('templates.rendered', expect.any(Function));
            expect(mockEventBus.on).toHaveBeenCalledWith('regulations.updated', expect.any(Function));
            expect(mockLogger.info).toHaveBeenCalledWith('ComplianceEngine initialized successfully');
        });
        
        it('should not initialize twice', async () => {
            await complianceEngine.initialize();
            
            // Reset mocks to check second call
            mockEventBus.on.mockClear();
            mockLogger.info.mockClear();
            
            await complianceEngine.initialize();
            
            // Should not register event listeners again
            expect(mockEventBus.on).not.toHaveBeenCalled();
        });
    });
    
    describe('rule management', () => {
        beforeEach(async () => {
            await complianceEngine.initialize();
        });
        
        it('should register and retrieve rules', () => {
            const mockRule = {
                id: 'test-rule-1',
                name: 'Test Rule',
                description: 'A test rule',
                framework: 'TEST',
                severity: 'warning' as const,
                validate: jest.fn().mockReturnValue([])
            };
            
            complianceEngine.registerRule(mockRule);
            
            const allRules = complianceEngine.getAllRules();
            expect(allRules).toContainEqual(mockRule);
            
            const frameworkRules = complianceEngine.getRulesByFramework('TEST');
            expect(frameworkRules).toContainEqual(mockRule);
        });
        
        it('should unregister rules', () => {
            const mockRule = {
                id: 'test-rule-2',
                name: 'Test Rule 2',
                description: 'A test rule to be unregistered',
                framework: 'TEST',
                severity: 'warning' as const,
                validate: jest.fn().mockReturnValue([])
            };
            
            complianceEngine.registerRule(mockRule);
            
            // Verify rule was registered
            let allRules = complianceEngine.getAllRules();
            expect(allRules).toContainEqual(mockRule);
            
            // Unregister rule
            const result = complianceEngine.unregisterRule('test-rule-2');
            expect(result).toBe(true);
            
            // Verify rule was unregistered
            allRules = complianceEngine.getAllRules();
            expect(allRules).not.toContainEqual(mockRule);
            
            // Verify framework registry was updated
            const frameworkRules = complianceEngine.getRulesByFramework('TEST');
            expect(frameworkRules).not.toContainEqual(mockRule);
        });
        
        it('should handle unregistering non-existent rules', () => {
            const result = complianceEngine.unregisterRule('non-existent-rule');
            expect(result).toBe(false);
        });
        
        it('should warn when registering a rule with an existing ID', () => {
            const mockRule1 = {
                id: 'duplicate-rule-id',
                name: 'First Rule',
                description: 'First rule with the ID',
                framework: 'TEST',
                severity: 'warning' as const,
                validate: jest.fn().mockReturnValue([])
            };
            
            const mockRule2 = {
                id: 'duplicate-rule-id',
                name: 'Second Rule',
                description: 'Second rule with the same ID',
                framework: 'TEST',
                severity: 'error' as const,
                validate: jest.fn().mockReturnValue([])
            };
            
            complianceEngine.registerRule(mockRule1);
            complianceEngine.registerRule(mockRule2);
            
            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining('Rule with ID duplicate-rule-id is already registered')
            );
            
            // The second rule should overwrite the first
            const allRules = complianceEngine.getAllRules();
            const retrievedRule = allRules.find(r => r.id === 'duplicate-rule-id');
            expect(retrievedRule).toEqual(mockRule2);
        });
    });
    
    describe('document validation', () => {
        beforeEach(async () => {
            await complianceEngine.initialize();
            
            // Register test rules
            const compliantRule = {
                id: 'compliant-rule',
                name: 'Always Compliant Rule',
                description: 'A rule that always passes',
                framework: 'TEST',
                severity: 'info' as const,
                validate: jest.fn().mockReturnValue([])
            };
            
            const nonCompliantRule = {
                id: 'non-compliant-rule',
                name: 'Always Non-Compliant Rule',
                description: 'A rule that always fails',
                framework: 'TEST',
                severity: 'error' as const,
                validate: jest.fn().mockReturnValue([
                    {
                        id: 'test-issue-1',
                        severity: 'error',
                        message: 'Test compliance issue',
                        location: {
                            startLine: 1,
                            startCharacter: 0,
                            endLine: 1,
                            endCharacter: 10
                        },
                        regulatoryReference: {
                            framework: 'TEST',
                            section: '1.2.3',
                            description: 'Test regulation'
                        },
                        suggestedFix: 'Fix the issue'
                    }
                ])
            };
            
            complianceEngine.registerRule(compliantRule);
            complianceEngine.registerRule(nonCompliantRule);
        });
        
        it('should validate documents and return results', () => {
            const options = {
                organization: sampleOrganization,
                jurisdictions: ['US'],
                frameworks: ['TEST'],
                strictMode: false,
                includeRecommendations: true,
                includeRiskAssessment: true
            };
            
            const result = complianceEngine.validateDocument(sampleDocument, options);
            
            expect(result).toBeDefined();
            expect(result.isCompliant).toBe(false);
            expect(result.issues.length).toBe(1);
            expect(result.issues[0]?.severity).toBe('error');
            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.riskAreas.length).toBeGreaterThan(0);
            
            // Verify event was emitted
            expect(mockEventBus.emit).toHaveBeenCalledWith(
                'compliance.validated',
                expect.objectContaining({
                    documentId: sampleDocument.id,
                    isCompliant: false,
                    issueCount: 1
                })
            );
        });
        
        it('should throw if not initialized', () => {
            // Create a new instance without initializing it
            const uninitializedEngine = new ComplianceEngine(mockEventBus, mockLogger);
            
            const options = {
                organization: sampleOrganization,
                jurisdictions: ['US'],
                frameworks: ['TEST']
            };
            
            expect(() => {
                uninitializedEngine.validateDocument(sampleDocument, options);
            }).toThrow('ComplianceEngine is not initialized');
        });
        
        it('should generate diagnostics for VS Code', () => {
            const options = {
                organization: sampleOrganization,
                jurisdictions: ['US'],
                frameworks: ['TEST']
            };
            
            const diagnostics = complianceEngine.getDiagnostics(sampleDocument, options);
            
            expect(diagnostics.length).toBe(1);
            expect(diagnostics[0]?.message).toBe('Test compliance issue');
            expect(diagnostics[0]?.severity).toBe(vscode.DiagnosticSeverity.Error);
            expect(diagnostics[0]?.source).toBe('ComplianceEngine');
        });
        
        it('should generate quick fixes for issues', () => {
            const issue: ComplianceIssue = {
                id: 'fix-issue',
                severity: 'warning',
                message: 'Issue with fix',
                location: {
                    startLine: 1,
                    startCharacter: 0,
                    endLine: 1,
                    endCharacter: 10
                },
                suggestedFix: 'Fixed content'
            };
            
            const quickFixes = complianceEngine.getQuickFixes(sampleDocument, issue);
            
            expect(quickFixes).toBeDefined();
            expect(quickFixes?.length).toBe(1);
            if (quickFixes && quickFixes.length > 0 && quickFixes[0]) {
                expect(quickFixes[0].title).toContain('Fix:');
                expect(quickFixes[0].edit).toBeDefined();
            }
        });
        
        it('should handle issues without suggested fixes', () => {
            const issue: ComplianceIssue = {
                id: 'no-fix-issue',
                severity: 'warning',
                message: 'Issue without fix'
                // No location or suggestedFix
            };
            
            const quickFixes = complianceEngine.getQuickFixes(sampleDocument, issue);
            
            expect(quickFixes).toBeUndefined();
        });
    });
    
    describe('compliance reporting', () => {
        beforeEach(async () => {
            await complianceEngine.initialize();
            
            // Register test rules
            const testRule = {
                id: 'report-test-rule',
                name: 'Report Test Rule',
                description: 'A rule for testing reports',
                framework: 'GDPR',
                severity: 'error' as const,
                validate: jest.fn().mockReturnValue([
                    {
                        id: 'gdpr-issue-1',
                        severity: 'error',
                        message: 'GDPR compliance issue',
                        regulatoryReference: {
                            framework: 'GDPR',
                            section: 'Article 13',
                            description: 'Information to be provided'
                        }
                    }
                ])
            };
            
            complianceEngine.registerRule(testRule);
        });
        
        it('should generate a compliance report', async () => {
            const report = await complianceEngine.generateComplianceReport(
                sampleOrganization,
                [sampleDocument]
            );
            
            expect(report).toBeDefined();
            expect(report.currentCompliance).toBeLessThan(1.0);
            expect(report.predictedCompliance).toBeGreaterThan(report.currentCompliance);
            expect(report.highRiskAreas.length).toBeGreaterThan(0);
            expect(report.recommendations.length).toBeGreaterThan(0);
            expect(report.timeline.events.length).toBeGreaterThan(0);
            expect(report.costEstimate.total).toBeGreaterThan(0);
        });
        
        it('should throw if not initialized', async () => {
            // Create a new instance without initializing it
            const uninitializedEngine = new ComplianceEngine(mockEventBus, mockLogger);
            
            await expect(uninitializedEngine.generateComplianceReport(
                sampleOrganization,
                [sampleDocument]
            )).rejects.toThrow('ComplianceEngine is not initialized');
        });
    });
    
    describe('dispose', () => {
        it('should dispose resources properly', async () => {
            await complianceEngine.initialize();
            
            complianceEngine.dispose();
            
            expect(mockEventBus.off).toHaveBeenCalledWith('document.saved', expect.any(Function));
            expect(mockEventBus.off).toHaveBeenCalledWith('templates.rendered', expect.any(Function));
            expect(mockEventBus.off).toHaveBeenCalledWith('regulations.updated', expect.any(Function));
            expect(mockLogger.info).toHaveBeenCalledWith('Disposing ComplianceEngine');
            
            // After disposal, the engine should be uninitialized
            const options = {
                organization: sampleOrganization,
                jurisdictions: ['US'],
                frameworks: ['TEST']
            };
            
            expect(() => {
                complianceEngine.validateDocument(sampleDocument, options);
            }).toThrow('ComplianceEngine is not initialized');
        });
    });
});
