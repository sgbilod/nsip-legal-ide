"use strict";
/**
 * Command definitions for the NSIP Legal IDE
 *
 * This file defines all commands used in the extension
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
/**
 * Namespace for all extension commands
 */
var Commands;
(function (Commands) {
    // Base command prefix
    const PREFIX = 'nsip-legal-ide';
    // Document related commands
    Commands.ANALYZE_DOCUMENT = `${PREFIX}.analyzeDocument`;
    Commands.GENERATE_DOCUMENT = `${PREFIX}.generateDocument`;
    Commands.EXPORT_DOCUMENT = `${PREFIX}.exportDocument`;
    // Template related commands
    Commands.CREATE_TEMPLATE = `${PREFIX}.createTemplate`;
    Commands.APPLY_TEMPLATE = `${PREFIX}.applyTemplate`;
    Commands.MANAGE_TEMPLATES = `${PREFIX}.manageTemplates`;
    // Clause related commands
    Commands.DETECT_CLAUSES = `${PREFIX}.detectClauses`;
    Commands.INSERT_CLAUSE = `${PREFIX}.insertClause`;
    Commands.VALIDATE_CLAUSE = `${PREFIX}.validateClause`;
    // Integration related commands
    Commands.CONNECT_API = `${PREFIX}.connectApi`;
    Commands.SEARCH_LEGAL_DB = `${PREFIX}.searchLegalDb`;
    Commands.FILE_GOVERNMENT_DOCUMENT = `${PREFIX}.fileGovernmentDocument`;
    // Smart contract related commands
    Commands.CREATE_SMART_CONTRACT = `${PREFIX}.createSmartContract`;
    Commands.DEPLOY_SMART_CONTRACT = `${PREFIX}.deploySmartContract`;
    Commands.VERIFY_SMART_CONTRACT = `${PREFIX}.verifySmartContract`;
    // Collaboration related commands
    Commands.START_COLLABORATION = `${PREFIX}.startCollaboration`;
    Commands.SHARE_DOCUMENT = `${PREFIX}.shareDocument`;
    Commands.END_COLLABORATION = `${PREFIX}.endCollaboration`;
    // AI/ML related commands
    Commands.ANALYZE_RISK = `${PREFIX}.analyzeRisk`;
    Commands.SUGGEST_IMPROVEMENTS = `${PREFIX}.suggestImprovements`;
    Commands.PREDICT_OUTCOMES = `${PREFIX}.predictOutcomes`;
    // Advanced feature commands
    Commands.ACTIVATE_ADVANCED_FEATURES = `${PREFIX}.activateAdvancedFeatures`;
    Commands.CONFIGURE_AI_SETTINGS = `${PREFIX}.configureAiSettings`;
    Commands.RUN_DIAGNOSTICS = `${PREFIX}.runDiagnostics`;
})(Commands || (exports.Commands = Commands = {}));
//# sourceMappingURL=commands.js.map