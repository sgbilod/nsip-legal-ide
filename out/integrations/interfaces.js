"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.ParticipantStatus = exports.ParticipantRole = exports.SessionStatus = exports.DeploymentStatus = exports.ContractType = exports.BlockchainNetwork = exports.EnterpriseSystem = exports.FilingStatus = exports.FilingType = exports.Jurisdiction = exports.LegalSource = exports.LegalDocumentType = void 0;
/**
 * Enum for legal document types
 */
var LegalDocumentType;
(function (LegalDocumentType) {
    LegalDocumentType["CASE"] = "case";
    LegalDocumentType["STATUTE"] = "statute";
    LegalDocumentType["REGULATION"] = "regulation";
    LegalDocumentType["CONTRACT"] = "contract";
    LegalDocumentType["BRIEF"] = "brief";
    LegalDocumentType["OPINION"] = "opinion";
    LegalDocumentType["FILING"] = "filing";
    LegalDocumentType["OTHER"] = "other";
})(LegalDocumentType || (exports.LegalDocumentType = LegalDocumentType = {}));
/**
 * Enum for legal sources
 */
var LegalSource;
(function (LegalSource) {
    LegalSource["WESTLAW"] = "westlaw";
    LegalSource["LEXISNEXIS"] = "lexisnexis";
    LegalSource["PACER"] = "pacer";
    LegalSource["COURTHOUSENEWS"] = "courthousenews";
    LegalSource["EDGAR"] = "edgar";
    LegalSource["USPTO"] = "uspto";
    LegalSource["CUSTOM"] = "custom";
})(LegalSource || (exports.LegalSource = LegalSource = {}));
/**
 * Enum for filing jurisdictions
 */
var Jurisdiction;
(function (Jurisdiction) {
    Jurisdiction["FEDERAL"] = "federal";
    Jurisdiction["STATE"] = "state";
    Jurisdiction["LOCAL"] = "local";
    Jurisdiction["INTERNATIONAL"] = "international";
})(Jurisdiction || (exports.Jurisdiction = Jurisdiction = {}));
/**
 * Enum for filing types
 */
var FilingType;
(function (FilingType) {
    FilingType["COMPLAINT"] = "complaint";
    FilingType["MOTION"] = "motion";
    FilingType["BRIEF"] = "brief";
    FilingType["RESPONSE"] = "response";
    FilingType["APPEAL"] = "appeal";
    FilingType["REGISTRATION"] = "registration";
    FilingType["APPLICATION"] = "application";
    FilingType["OTHER"] = "other";
})(FilingType || (exports.FilingType = FilingType = {}));
/**
 * Enum for filing status
 */
var FilingStatus;
(function (FilingStatus) {
    FilingStatus["DRAFT"] = "draft";
    FilingStatus["SUBMITTED"] = "submitted";
    FilingStatus["PENDING"] = "pending";
    FilingStatus["ACCEPTED"] = "accepted";
    FilingStatus["REJECTED"] = "rejected";
    FilingStatus["COMPLETED"] = "completed";
})(FilingStatus || (exports.FilingStatus = FilingStatus = {}));
/**
 * Enum for enterprise systems
 */
var EnterpriseSystem;
(function (EnterpriseSystem) {
    EnterpriseSystem["SALESFORCE"] = "salesforce";
    EnterpriseSystem["DYNAMICS"] = "dynamics";
    EnterpriseSystem["SAP"] = "sap";
    EnterpriseSystem["ORACLE"] = "oracle";
})(EnterpriseSystem || (exports.EnterpriseSystem = EnterpriseSystem = {}));
/**
 * Enum for blockchain networks
 */
var BlockchainNetwork;
(function (BlockchainNetwork) {
    BlockchainNetwork["ETHEREUM"] = "ethereum";
    BlockchainNetwork["POLYGON"] = "polygon";
    BlockchainNetwork["ARBITRUM"] = "arbitrum";
    BlockchainNetwork["SOLANA"] = "solana";
    BlockchainNetwork["OPTIMISM"] = "optimism";
})(BlockchainNetwork || (exports.BlockchainNetwork = BlockchainNetwork = {}));
/**
 * Enum for contract types
 */
var ContractType;
(function (ContractType) {
    ContractType["NDA"] = "nda";
    ContractType["SLA"] = "sla";
    ContractType["EMPLOYMENT"] = "employment";
    ContractType["LICENSING"] = "licensing";
    ContractType["SALE"] = "sale";
    ContractType["PARTNERSHIP"] = "partnership";
    ContractType["CUSTOM"] = "custom";
})(ContractType || (exports.ContractType = ContractType = {}));
/**
 * Enum for deployment status
 */
var DeploymentStatus;
(function (DeploymentStatus) {
    DeploymentStatus["PENDING"] = "pending";
    DeploymentStatus["CONFIRMED"] = "confirmed";
    DeploymentStatus["FAILED"] = "failed";
    DeploymentStatus["REVERTED"] = "reverted";
})(DeploymentStatus || (exports.DeploymentStatus = DeploymentStatus = {}));
/**
 * Enum for session status
 */
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["ACTIVE"] = "active";
    SessionStatus["PAUSED"] = "paused";
    SessionStatus["ENDED"] = "ended";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
/**
 * Enum for participant roles
 */
var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["AUTHOR"] = "author";
    ParticipantRole["REVIEWER"] = "reviewer";
    ParticipantRole["APPROVER"] = "approver";
    ParticipantRole["OBSERVER"] = "observer";
})(ParticipantRole || (exports.ParticipantRole = ParticipantRole = {}));
/**
 * Enum for participant status
 */
var ParticipantStatus;
(function (ParticipantStatus) {
    ParticipantStatus["ONLINE"] = "online";
    ParticipantStatus["AWAY"] = "away";
    ParticipantStatus["OFFLINE"] = "offline";
})(ParticipantStatus || (exports.ParticipantStatus = ParticipantStatus = {}));
/**
 * Enum for permissions
 */
var Permission;
(function (Permission) {
    Permission["READ"] = "read";
    Permission["WRITE"] = "write";
    Permission["COMMENT"] = "comment";
    Permission["SUGGEST"] = "suggest";
    Permission["APPROVE"] = "approve";
})(Permission || (exports.Permission = Permission = {}));
//# sourceMappingURL=interfaces.js.map