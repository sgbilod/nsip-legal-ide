export interface RevenueConfig {
    models: RevenueModel[];
    activeModel: string;
    pricingTiers: PricingTier[];
    discounts: Discount[];
    taxRates: TaxRate[];
    paymentMethods: PaymentMethod[];
    billingCycle: BillingCycle;
}
export interface RevenueModel {
    id: string;
    name: string;
    type: RevenueModelType;
    description: string;
    enabled: boolean;
    configurations: Record<string, any>;
}
export type RevenueModelType = 'SUBSCRIPTION' | 'USAGE_BASED' | 'TRANSACTION_BASED' | 'VALUE_BASED' | 'SUCCESS_BASED' | 'HYBRID';
export interface PricingTier {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    currency: string;
    features: Feature[];
    limits: ResourceLimit[];
}
export interface Feature {
    id: string;
    name: string;
    description: string;
    included: boolean;
    value?: number | string;
    unit?: string;
}
export interface ResourceLimit {
    resource: string;
    limit: number;
    unit: string;
    overage?: OverageRate;
}
export interface OverageRate {
    price: number;
    per: number;
    unit: string;
}
export interface Discount {
    id: string;
    name: string;
    type: 'PERCENTAGE' | 'FIXED' | 'FREE_UNITS';
    value: number;
    startDate?: Date;
    endDate?: Date;
    code?: string;
    eligible: EligibilityCriteria;
    stackable: boolean;
    maxUsage?: number;
}
export interface EligibilityCriteria {
    userTypes?: string[];
    minSpend?: number;
    minUsage?: number;
    products?: string[];
    regions?: string[];
}
export interface TaxRate {
    id: string;
    name: string;
    rate: number;
    regions: string[];
    productTypes?: string[];
}
export interface PaymentMethod {
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    processingFee: number;
    processingFeeType: 'PERCENTAGE' | 'FIXED';
}
export interface BillingCycle {
    frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'CUSTOM';
    dayOfMonth?: number;
    gracePeriod: number;
    invoiceInAdvance: boolean;
}
export interface SubscriptionConfig {
    tiers: SubscriptionTier[];
    billingPeriods: BillingPeriod[];
    features: SubscriptionFeature[];
    trialPeriod: number;
    autoRenew: boolean;
    cancellationPolicy: CancellationPolicy;
}
export interface SubscriptionTier {
    id: string;
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    features: SubscriptionFeature[];
    maxUsers: number;
}
export interface SubscriptionFeature {
    id: string;
    name: string;
    description: string;
    limits?: Record<string, number>;
}
export interface BillingPeriod {
    id: string;
    name: string;
    durationMonths: number;
    discountPercentage: number;
}
export interface CancellationPolicy {
    refundType: 'NONE' | 'PRORATED' | 'FULL';
    cancellationFee: number;
    noticePeriod: number;
}
export interface UsageBasedConfig {
    metrics: UsageMetric[];
    tiers: UsageTier[];
    minimumSpend: number;
    billingFrequency: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
}
export interface UsageMetric {
    id: string;
    name: string;
    unit: string;
    description: string;
    aggregation: 'SUM' | 'MAX' | 'AVERAGE';
}
export interface UsageTier {
    metricId: string;
    tierLevels: TierLevel[];
}
export interface TierLevel {
    min: number;
    max?: number;
    pricePerUnit: number;
    flatFee?: number;
}
export interface ValueBasedConfig {
    valueMetrics: ValueMetric[];
    valueTiers: ValueTier[];
    benchmarks: Benchmark[];
    reportingFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
}
export interface ValueMetric {
    id: string;
    name: string;
    description: string;
    unit: string;
    calculationMethod: string;
    dataSource: string;
}
export interface ValueTier {
    metricId: string;
    percentage: number;
    minValue: number;
    maxValue?: number;
    capAmount?: number;
}
export interface Benchmark {
    metricId: string;
    baselineValue: number;
    targetValue: number;
    improvementThreshold: number;
}
export interface SuccessBasedConfig {
    outcomes: Outcome[];
    paymentSchedule: 'IMMEDIATE' | 'MILESTONE' | 'DEFERRED';
    verificationMethod: 'SELF_REPORTED' | 'AUTOMATED' | 'THIRD_PARTY';
}
export interface Outcome {
    id: string;
    name: string;
    description: string;
    metric: string;
    targetValue: number;
    payment: number;
    bonusThreshold?: number;
    bonusPayment?: number;
}
export interface HybridConfig {
    baseModel: RevenueModelType;
    secondaryModels: RevenueModelType[];
    weightDistribution: Record<string, number>;
}
export interface BillingInfo {
    customerId: string;
    customerName: string;
    billingAddress: Address;
    paymentMethod: string;
    taxExempt: boolean;
    taxId?: string;
}
export interface Address {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}
export interface Invoice {
    id: string;
    customerId: string;
    date: Date;
    dueDate: Date;
    items: InvoiceItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    paidAmount: number;
    paidDate?: Date;
    notes?: string;
}
export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate: number;
    discountAmount: number;
    period?: {
        start: Date;
        end: Date;
    };
}
export interface UsageRecord {
    customerId: string;
    metricId: string;
    quantity: number;
    timestamp: Date;
    metadata: Record<string, any>;
}
export interface UsageSummary {
    customerId: string;
    billingPeriod: {
        start: Date;
        end: Date;
    };
    metrics: MetricUsage[];
    totalCost: number;
}
export interface MetricUsage {
    metricId: string;
    usage: number;
    cost: number;
    limit?: number;
    overageUsage?: number;
    overageCost?: number;
}
/**
 * Revenue Manager - Manages revenue models and billing
 */
export declare class RevenueManager {
    private logger;
    private eventBus;
    private config;
    /**
     * Create a new Revenue Manager
     */
    constructor();
    /**
     * Initialize the revenue manager
     */
    initialize(): Promise<void>;
    /**
     * Get default revenue configuration
     */
    private getDefaultConfig;
    /**
     * Load revenue configuration
     */
    private loadConfig;
    /**
     * Handle customer created event
     * @param customer Customer data
     */
    private handleCustomerCreated;
    /**
     * Handle usage recorded event
     * @param usage Usage record
     */
    private handleUsageRecorded;
    /**
     * Handle subscription changed event
     * @param subscription Subscription data
     */
    private handleSubscriptionChanged;
    /**
     * Generate an invoice for a customer
     * @param data Invoice generation data containing customerId and billingPeriod
     * @returns Generated invoice
     */
    generateInvoice(data: {
        customerId: string;
        billingPeriod: {
            start: Date;
            end: Date;
        };
    }): Promise<Invoice>;
    /**
     * Calculate pricing for usage
     * @param metricId Metric ID
     * @param quantity Usage quantity
     * @returns Calculated price
     */
    calculateUsagePrice(metricId: string, quantity: number): number;
    /**
     * Calculate value-based pricing
     * @param metricId Value metric ID
     * @param value Measured value
     * @returns Calculated price
     */
    calculateValuePrice(metricId: string, value: number): number;
    /**
     * Apply discounts to a price
     * @param basePrice Base price
     * @param customerId Customer ID
     * @param productIds Product IDs
     * @param userType User type
     * @returns Price after discounts
     */
    applyDiscounts(basePrice: number, _customerId: string, productIds: string[], userType: string): number;
    /**
     * Record usage for a customer
     * @param customerId Customer ID
     * @param metricId Metric ID
     * @param quantity Usage quantity
     * @param metadata Additional metadata
     */
    recordUsage(customerId: string, metricId: string, quantity: number, metadata?: Record<string, any>): Promise<void>;
    /**
     * Get revenue models
     * @returns Revenue models
     */
    getRevenueModels(): RevenueModel[];
    /**
     * Get pricing tiers
     * @returns Pricing tiers
     */
    getPricingTiers(): PricingTier[];
    /**
     * Get active revenue model
     * @returns Active revenue model
     */
    getActiveRevenueModel(): RevenueModel;
    /**
     * Set active revenue model
     * @param modelId Revenue model ID
     */
    setActiveRevenueModel(modelId: string): void;
    /**
     * Dispose the revenue manager
     */
    dispose(): void;
}
