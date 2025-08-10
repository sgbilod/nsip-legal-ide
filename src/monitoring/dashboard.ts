import { readFileSync } from 'fs';
import { join } from 'path';

interface MetricConfig {
    target: string;
    critical: string;
}

interface PerformanceConfig {
    metrics: Record<string, MetricConfig>;
}

class PerformanceDashboard {
    private config: PerformanceConfig;

    constructor() {
        const configPath = join(__dirname, 'performance.config.json');
        this.config = JSON.parse(readFileSync(configPath, 'utf-8'));
    }

    track(operation: string, duration: number): void {
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

    private alertDeveloper(operation: string, duration: number): void {
        console.error(`Critical performance issue detected in ${operation}: ${duration}ms`);
        // Add logic to notify developers (e.g., email, Slack, etc.)
    }

    trackRealTimeMetrics(): void {
        setInterval(() => {
            const operations = Object.keys(this.config.metrics);
            operations.forEach(operation => {
                const duration = Math.random() * 1000; // Simulated duration
                this.track(operation, duration);
            });
        }, 5000); // Every 5 seconds
    }
}

export default PerformanceDashboard;
