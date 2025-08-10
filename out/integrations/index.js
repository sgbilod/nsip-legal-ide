"use strict";
/**
 * Integration Layer
 * Provides a unified interface for connecting to external systems
 */
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureCommunication = exports.RealTimeCollaboration = exports.DecentralizedIdentityService = exports.MultiChainPlatform = exports.EnterpriseIntegration = exports.GovernmentFilingIntegration = exports.LegalApiGateway = void 0;
exports.initializeIntegrations = initializeIntegrations;
// Core integrations
const legalApiGateway_1 = require("./legalApiGateway");
Object.defineProperty(exports, "LegalApiGateway", { enumerable: true, get: function () { return legalApiGateway_1.LegalApiGateway; } });
const governmentFiling_1 = require("./governmentFiling");
Object.defineProperty(exports, "GovernmentFilingIntegration", { enumerable: true, get: function () { return governmentFiling_1.GovernmentFilingIntegration; } });
const enterprise_1 = require("./enterprise");
Object.defineProperty(exports, "EnterpriseIntegration", { enumerable: true, get: function () { return enterprise_1.EnterpriseIntegration; } });
// Blockchain integrations
const multiChainPlatform_1 = require("../blockchain/multiChainPlatform");
Object.defineProperty(exports, "MultiChainPlatform", { enumerable: true, get: function () { return multiChainPlatform_1.MultiChainPlatform; } });
const decentralizedIdentity_1 = require("../blockchain/decentralizedIdentity");
Object.defineProperty(exports, "DecentralizedIdentityService", { enumerable: true, get: function () { return decentralizedIdentity_1.DecentralizedIdentityService; } });
// Collaboration integrations
const realTimeEngine_1 = require("../collaboration/realTimeEngine");
Object.defineProperty(exports, "RealTimeCollaboration", { enumerable: true, get: function () { return realTimeEngine_1.RealTimeCollaboration; } });
const secureCommunication_1 = require("../collaboration/secureCommunication");
Object.defineProperty(exports, "SecureCommunication", { enumerable: true, get: function () { return secureCommunication_1.SecureCommunication; } });
// Interfaces
__exportStar(require("./interfaces"), exports);
/**
 * Initialize all integration services
 * @param serviceRegistry Service registry instance
 */
async function initializeIntegrations(serviceRegistry) {
    // Create instances
    const legalApi = new legalApiGateway_1.LegalApiGateway();
    const governmentFiling = new governmentFiling_1.GovernmentFilingIntegration();
    const enterprise = new enterprise_1.EnterpriseIntegration();
    const blockchain = new multiChainPlatform_1.MultiChainPlatform();
    const identity = new decentralizedIdentity_1.DecentralizedIdentityService();
    const collaboration = new realTimeEngine_1.RealTimeCollaboration();
    const communication = new secureCommunication_1.SecureCommunication();
    // Register services
    serviceRegistry.register('legalApi', legalApi);
    serviceRegistry.register('governmentFiling', governmentFiling);
    serviceRegistry.register('enterprise', enterprise);
    serviceRegistry.register('blockchain', blockchain);
    serviceRegistry.register('identity', identity);
    serviceRegistry.register('collaboration', collaboration);
    serviceRegistry.register('communication', communication);
    // Initialize services
    await legalApi.initialize();
    await governmentFiling.initialize();
    await enterprise.initialize();
    await blockchain.initialize();
    await identity.initialize();
    await collaboration.initialize();
    await communication.initialize();
}
//# sourceMappingURL=index.js.map