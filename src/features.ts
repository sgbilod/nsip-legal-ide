/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import * as vscode from 'vscode';
import { PatentAnalysisController } from './ai/controllers/PatentAnalysisController';
import { MultiChainController } from './blockchain/controllers/MultiChainController';
import { CollaborationController } from './collaboration/controllers/CollaborationController';
import { AnalyticsController } from './monitoring/controllers/AnalyticsController';

export function registerFeatures(context: vscode.ExtensionContext): void {
    // Initialize controllers
    new PatentAnalysisController(context);
    new MultiChainController(context);
    new CollaborationController(context);
    new AnalyticsController(context);
}
