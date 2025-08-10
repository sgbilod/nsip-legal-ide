/**
 * Command definitions for the NSIP Legal IDE
 * 
 * This file defines all commands used in the extension
 */

/**
 * Namespace for all extension commands
 */
export namespace Commands {
    // Base command prefix
    const PREFIX = 'nsip-legal-ide';
    
    // Document related commands
    export const ANALYZE_DOCUMENT = `${PREFIX}.analyzeDocument`;
    export const GENERATE_DOCUMENT = `${PREFIX}.generateDocument`;
    export const EXPORT_DOCUMENT = `${PREFIX}.exportDocument`;
    
    // Template related commands
    export const CREATE_TEMPLATE = `${PREFIX}.createTemplate`;
    export const APPLY_TEMPLATE = `${PREFIX}.applyTemplate`;
    export const MANAGE_TEMPLATES = `${PREFIX}.manageTemplates`;
    
    // Clause related commands
    export const DETECT_CLAUSES = `${PREFIX}.detectClauses`;
    export const INSERT_CLAUSE = `${PREFIX}.insertClause`;
    export const VALIDATE_CLAUSE = `${PREFIX}.validateClause`;
    
    // Integration related commands
    export const CONNECT_API = `${PREFIX}.connectApi`;
    export const SEARCH_LEGAL_DB = `${PREFIX}.searchLegalDb`;
    export const FILE_GOVERNMENT_DOCUMENT = `${PREFIX}.fileGovernmentDocument`;
    
    // Smart contract related commands
    export const CREATE_SMART_CONTRACT = `${PREFIX}.createSmartContract`;
    export const DEPLOY_SMART_CONTRACT = `${PREFIX}.deploySmartContract`;
    export const VERIFY_SMART_CONTRACT = `${PREFIX}.verifySmartContract`;
    
    // Collaboration related commands
    export const START_COLLABORATION = `${PREFIX}.startCollaboration`;
    export const SHARE_DOCUMENT = `${PREFIX}.shareDocument`;
    export const END_COLLABORATION = `${PREFIX}.endCollaboration`;
    
    // AI/ML related commands
    export const ANALYZE_RISK = `${PREFIX}.analyzeRisk`;
    export const SUGGEST_IMPROVEMENTS = `${PREFIX}.suggestImprovements`;
    export const PREDICT_OUTCOMES = `${PREFIX}.predictOutcomes`;
    
    // Advanced feature commands
    export const ACTIVATE_ADVANCED_FEATURES = `${PREFIX}.activateAdvancedFeatures`;
    export const CONFIGURE_AI_SETTINGS = `${PREFIX}.configureAiSettings`;
    export const RUN_DIAGNOSTICS = `${PREFIX}.runDiagnostics`;
}
