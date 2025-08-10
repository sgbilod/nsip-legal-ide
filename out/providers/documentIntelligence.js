"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentIntelligenceProvider = void 0;
const vscode = __importStar(require("vscode"));
const serviceRegistry_1 = require("../core/serviceRegistry");
/**
 * Document Intelligence Provider - Provides document analysis and intelligence features
 */
class DocumentIntelligenceProvider {
    /**
     * Create a new document intelligence provider
     * @param context Extension context
     */
    constructor(context) {
        this.context = context;
        this.legalTerms = new Map();
        this.logger = serviceRegistry_1.ServiceRegistry.getInstance().get('logger');
    }
    /**
     * Initialize the document intelligence provider
     */
    async initialize() {
        // Load legal terms
        await this.loadLegalTerms();
        this.logger.info('Document intelligence provider initialized');
    }
    /**
     * Load legal terms from extension resources
     */
    async loadLegalTerms() {
        try {
            // In a real implementation, these would be loaded from a JSON file
            // For this example, we'll hard-code a few terms
            this.legalTerms.set('indemnification', {
                term: 'indemnification',
                definition: 'A duty to compensate for a loss; security against legal liability for one\'s actions.',
                riskLevel: 'high',
                alternatives: ['hold harmless', 'defend']
            });
            this.legalTerms.set('force majeure', {
                term: 'force majeure',
                definition: 'Unforeseeable circumstances that prevent someone from fulfilling a contract.',
                riskLevel: 'medium',
                alternatives: ['act of god', 'unavoidable accident']
            });
            this.legalTerms.set('warranty', {
                term: 'warranty',
                definition: 'A promise that something in furtherance of the contract is guaranteed by one of the contracting parties.',
                riskLevel: 'medium',
                alternatives: ['guarantee', 'assurance']
            });
            this.legalTerms.set('liability', {
                term: 'liability',
                definition: 'The state of being legally responsible for something.',
                riskLevel: 'high',
                alternatives: ['legal responsibility', 'obligation']
            });
            this.logger.info(`Loaded ${this.legalTerms.size} legal terms`);
        }
        catch (error) {
            this.logger.error('Failed to load legal terms', error);
        }
    }
    /**
     * Analyze a document
     * @param document The document to analyze
     * @returns Analysis results
     */
    async analyzeDocument(document) {
        this.logger.info(`Analyzing document: ${document.fileName}`);
        const text = document.getText();
        const diagnostics = [];
        const insights = [];
        const riskAssessment = {
            overallRisk: 'low',
            areas: []
        };
        // Simple term-based analysis
        for (const [term, info] of this.legalTerms.entries()) {
            const regex = new RegExp(`\\b${term}\\b`, 'gi');
            let match;
            while ((match = regex.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + term.length);
                const range = new vscode.Range(startPos, endPos);
                // Add diagnostic for high-risk terms
                if (info.riskLevel === 'high') {
                    diagnostics.push(new vscode.Diagnostic(range, `High-risk legal term: ${term}. Consider alternatives: ${info.alternatives.join(', ')}`, vscode.DiagnosticSeverity.Warning));
                }
                // Add insight
                insights.push({
                    range,
                    term: info.term,
                    message: `${info.term} - ${info.definition}`,
                    riskLevel: info.riskLevel
                });
            }
        }
        // Check for missing sections (very basic)
        const sections = [
            'indemnification',
            'liability',
            'warranty',
            'termination'
        ];
        const missingSections = sections.filter(section => !text.toLowerCase().includes(section.toLowerCase()));
        if (missingSections.length > 0) {
            riskAssessment.areas.push({
                name: 'Missing Sections',
                risk: 'medium',
                description: `Document is missing the following sections: ${missingSections.join(', ')}`
            });
        }
        // Update diagnostics collection
        const diagnosticsCollection = serviceRegistry_1.ServiceRegistry.getInstance().get('diagnostics');
        diagnosticsCollection.set(document.uri, diagnostics);
        // Determine overall risk based on insights
        const highRiskCount = insights.filter(i => i.riskLevel === 'high').length;
        const mediumRiskCount = insights.filter(i => i.riskLevel === 'medium').length;
        if (highRiskCount > 3) {
            riskAssessment.overallRisk = 'high';
        }
        else if (highRiskCount > 0 || mediumRiskCount > 3) {
            riskAssessment.overallRisk = 'medium';
        }
        // Add risk areas based on term categories
        if (highRiskCount > 0) {
            riskAssessment.areas.push({
                name: 'High-Risk Terms',
                risk: 'high',
                description: `Document contains ${highRiskCount} high-risk legal terms`
            });
        }
        return {
            diagnostics,
            insights,
            riskAssessment
        };
    }
    /**
     * Provide completion items
     */
    provideCompletionItems(document, position, token, context) {
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        // Simple completion items for legal terms
        const completionItems = [];
        for (const [term, info] of this.legalTerms.entries()) {
            const item = new vscode.CompletionItem(term, vscode.CompletionItemKind.Text);
            item.documentation = new vscode.MarkdownString(`**${term}**: ${info.definition}`);
            item.detail = `Risk Level: ${info.riskLevel}`;
            completionItems.push(item);
        }
        return completionItems;
    }
    /**
     * Provide hover information
     */
    provideHover(document, position, token) {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }
        const word = document.getText(range).toLowerCase();
        const legalTerm = this.legalTerms.get(word);
        if (legalTerm) {
            const content = new vscode.MarkdownString();
            content.appendMarkdown(`## ${legalTerm.term}\n\n`);
            content.appendMarkdown(`${legalTerm.definition}\n\n`);
            content.appendMarkdown(`**Risk Level**: ${legalTerm.riskLevel}\n\n`);
            if (legalTerm.alternatives.length > 0) {
                content.appendMarkdown(`**Alternatives**: ${legalTerm.alternatives.join(', ')}`);
            }
            return new vscode.Hover(content, range);
        }
        return null;
    }
    /**
     * Dispose the document intelligence provider
     */
    dispose() {
        // No resources to dispose
    }
}
exports.DocumentIntelligenceProvider = DocumentIntelligenceProvider;
//# sourceMappingURL=documentIntelligence.js.map