declare class PerformanceDashboard {
    private config;
    constructor();
    track(operation: string, duration: number): void;
    private alertDeveloper;
    trackRealTimeMetrics(): void;
}
export default PerformanceDashboard;
