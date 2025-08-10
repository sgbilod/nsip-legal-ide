"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_1 = __importDefault(require("./dashboard"));
class PerformanceVisualization {
    constructor() {
        this.dashboard = new dashboard_1.default();
    }
    visualize() {
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
//# sourceMappingURL=visualization.js.map