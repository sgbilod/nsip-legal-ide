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
exports.Logger = exports.LogLevel = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Log levels for the extension
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Logger - Provides logging functionality for the extension
 */
class Logger {
    /**
     * Create a new logger instance
     * @param context Extension context
     */
    constructor(context) {
        this.context = context;
        this.logLevel = LogLevel.INFO;
        this.outputChannel = vscode.window.createOutputChannel('NSIP Legal IDE');
        this.context.subscriptions.push(this.outputChannel);
        // Get log level from configuration
        this.updateLogLevelFromConfig();
        // Listen for configuration changes
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('nsip.logging.level')) {
                this.updateLogLevelFromConfig();
            }
        }));
    }
    /**
     * Initialize the logger
     */
    async initialize() {
        this.info('Logger initialized');
    }
    /**
     * Update log level from VS Code configuration
     */
    updateLogLevelFromConfig() {
        const config = vscode.workspace.getConfiguration('nsip');
        const configLevel = config.get('logging.level', 'info');
        switch (configLevel.toLowerCase()) {
            case 'debug':
                this.logLevel = LogLevel.DEBUG;
                break;
            case 'info':
                this.logLevel = LogLevel.INFO;
                break;
            case 'warn':
                this.logLevel = LogLevel.WARN;
                break;
            case 'error':
                this.logLevel = LogLevel.ERROR;
                break;
            default:
                this.logLevel = LogLevel.INFO;
        }
        this.info(`Log level set to ${LogLevel[this.logLevel]}`);
    }
    /**
     * Log a debug message
     * @param message The message to log
     * @param data Optional data to log
     */
    debug(message, data) {
        this.log(LogLevel.DEBUG, message, data);
    }
    /**
     * Log an info message
     * @param message The message to log
     * @param data Optional data to log
     */
    info(message, data) {
        this.log(LogLevel.INFO, message, data);
    }
    /**
     * Log a warning message
     * @param message The message to log
     * @param data Optional data to log
     */
    warn(message, data) {
        this.log(LogLevel.WARN, message, data);
    }
    /**
     * Log an error message
     * @param message The message to log
     * @param error Optional error to log
     */
    error(message, error) {
        this.log(LogLevel.ERROR, message, error);
    }
    /**
     * Log a message at the specified level
     * @param level The log level
     * @param message The message to log
     * @param data Optional data to log
     */
    log(level, message, data) {
        if (level < this.logLevel) {
            return;
        }
        const timestamp = new Date().toISOString();
        const levelString = LogLevel[level].padEnd(5);
        let logMessage = `[${timestamp}] [${levelString}] ${message}`;
        if (data) {
            if (data instanceof Error) {
                logMessage += `\n${data.stack || data.message}`;
            }
            else {
                try {
                    logMessage += `\n${JSON.stringify(data, null, 2)}`;
                }
                catch {
                    logMessage += `\n${data}`;
                }
            }
        }
        this.outputChannel.appendLine(logMessage);
        // Show output channel for errors if not already visible
        if (level === LogLevel.ERROR) {
            this.outputChannel.show(true);
        }
    }
    /**
     * Dispose the logger
     */
    dispose() {
        // OutputChannel is automatically disposed by the extension context
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map