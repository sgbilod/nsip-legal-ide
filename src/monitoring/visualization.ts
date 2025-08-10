import PerformanceDashboard from './dashboard';

class PerformanceVisualization {
    private dashboard: PerformanceDashboard;

    constructor() {
        this.dashboard = new PerformanceDashboard();
    }

    visualize(): void {
        console.log('Visualizing performance metrics...');
        const operations = Object.keys(this.dashboard['config'].metrics);
        operations.forEach(operation => {
            console.log(`Operation: ${operation}`);
            console.log(`Target: ${this.dashboard['config'].metrics[operation].target}`);
            console.log(`Critical: ${this.dashboard['config'].metrics[operation].critical}`);
        });
    }
}

const visualization = new PerformanceVisualization();
visualization.visualize();
