"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
class PerformanceDashboard {
    constructor() {
        const configPath = (0, path_1.join)(__dirname, 'performance.config.json');
        this.config = JSON.parse((0, fs_1.readFileSync)(configPath, 'utf-8'));
    }
    track(operation, duration) {
        const metric = this.config.metrics[operation];
        if (!metric) {
            console.warn(`No metric configuration found for operation: ${operation}`);
            return;
        }
        console.log(`Operation: ${operation}, Duration: ${duration}ms`);
        if (duration > parseInt(metric.critical.replace(/[^0-9]/g, ''))) {
            this.alertDeveloper(operation, duration);
        }
    }
    alertDeveloper(operation, duration) {
        console.error(`Critical performance issue detected in ${operation}: ${duration}ms`);
        // Add logic to notify developers (e.g., email, Slack, etc.)
    }
    trackRealTimeMetrics() {
        setInterval(() => {
            const operations = Object.keys(this.config.metrics);
            operations.forEach(operation => {
                const duration = Math.random() * 1000; // Simulated duration
                this.track(operation, duration);
            });
        }, 5000); // Every 5 seconds
    }
}
exports.default = PerformanceDashboard;
//# sourceMappingURL=dashboard.js.map