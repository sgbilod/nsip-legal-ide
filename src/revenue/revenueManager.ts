import { ServiceRegistry } from '../core/serviceRegistry';
import { Logger } from '../core/logger';
import { EventBus } from '../core/eventBus';

// Types for revenue models
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

export type RevenueModelType = 
    'SUBSCRIPTION' | 
    'USAGE_BASED' | 
    'TRANSACTION_BASED' | 
    'VALUE_BASED' | 
    'SUCCESS_BASED' | 
    'HYBRID';

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

// Subscription model types
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

// Usage-based model types
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

// Value-based model types
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

// Success-based model types
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

// Hybrid model types
export interface HybridConfig {
    baseModel: RevenueModelType;
    secondaryModels: RevenueModelType[];
    weightDistribution: Record<string, number>;
}

// Billing and invoice types
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

// Usage tracking types
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
export class RevenueManager {
    private logger: Logger;
    private eventBus: EventBus;
    private config: RevenueConfig;
    
    /**
     * Create a new Revenue Manager
     */
    constructor() {
        this.logger = ServiceRegistry.getInstance().get<Logger>('logger');
        this.eventBus = ServiceRegistry.getInstance().get<EventBus>('eventBus');
        
        // Initialize with default config
        this.config = this.getDefaultConfig();
    }
    
    /**
     * Initialize the revenue manager
     */
    async initialize(): Promise<void> {
        this.logger.info('Initializing revenue manager');
        
        // Load configuration
        await this.loadConfig();
        
        // Register for events
        this.eventBus.subscribe<any>('customer.created', {
            id: 'revenue-customer-created',
            handle: this.handleCustomerCreated.bind(this)
        });
        
        this.eventBus.subscribe<UsageRecord>('usage.recorded', {
            id: 'revenue-usage-recorded',
            handle: this.handleUsageRecorded.bind(this)
        });
        
        this.eventBus.subscribe<any>('subscription.changed', {
            id: 'revenue-subscription-changed',
            handle: this.handleSubscriptionChanged.bind(this)
        });
        
        this.eventBus.subscribe<{customerId: string, billingPeriod: { start: Date; end: Date; }}>('invoice.generate', {
            id: 'revenue-invoice-generate',
            handle: this.generateInvoice.bind(this)
        });
        
        this.logger.info('Revenue manager initialized');
    }
    
    /**
     * Get default revenue configuration
     */
    private getDefaultConfig(): RevenueConfig {
        return {
            models: [
                {
                    id: 'subscription',
                    name: 'Subscription',
                    type: 'SUBSCRIPTION',
                    description: 'Monthly or annual subscription model',
                    enabled: true,
                    configurations: {
                        tiers: [
                            {
                                id: 'basic',
                                name: 'Basic',
                                monthlyPrice: 49.99,
                                annualPrice: 499.99,
                                features: [],
                                maxUsers: 5
                            },
                            {
                                id: 'professional',
                                name: 'Professional',
                                monthlyPrice: 99.99,
                                annualPrice: 999.99,
                                features: [],
                                maxUsers: 20
                            },
                            {
                                id: 'enterprise',
                                name: 'Enterprise',
                                monthlyPrice: 199.99,
                                annualPrice: 1999.99,
                                features: [],
                                maxUsers: 100
                            }
                        ],
                        billingPeriods: [
                            {
                                id: 'monthly',
                                name: 'Monthly',
                                durationMonths: 1,
                                discountPercentage: 0
                            },
                            {
                                id: 'annual',
                                name: 'Annual',
                                durationMonths: 12,
                                discountPercentage: 16.67
                            }
                        ],
                        trialPeriod: 14,
                        autoRenew: true,
                        cancellationPolicy: {
                            refundType: 'PRORATED',
                            cancellationFee: 0,
                            noticePeriod: 0
                        }
                    }
                },
                {
                    id: 'usage',
                    name: 'Usage-Based',
                    type: 'USAGE_BASED',
                    description: 'Pay for what you use',
                    enabled: true,
                    configurations: {
                        metrics: [
                            {
                                id: 'document-analysis',
                                name: 'Document Analysis',
                                unit: 'document',
                                description: 'Number of documents analyzed',
                                aggregation: 'SUM'
                            },
                            {
                                id: 'document-generation',
                                name: 'Document Generation',
                                unit: 'document',
                                description: 'Number of documents generated',
                                aggregation: 'SUM'
                            },
                            {
                                id: 'clause-detection',
                                name: 'Clause Detection',
                                unit: 'clause',
                                description: 'Number of clauses detected',
                                aggregation: 'SUM'
                            }
                        ],
                        tiers: [
                            {
                                metricId: 'document-analysis',
                                tierLevels: [
                                    {
                                        min: 0,
                                        max: 10,
                                        pricePerUnit: 5.00
                                    },
                                    {
                                        min: 11,
                                        max: 50,
                                        pricePerUnit: 4.00
                                    },
                                    {
                                        min: 51,
                                        max: null,
                                        pricePerUnit: 3.00
                                    }
                                ]
                            },
                            {
                                metricId: 'document-generation',
                                tierLevels: [
                                    {
                                        min: 0,
                                        max: 10,
                                        pricePerUnit: 3.00
                                    },
                                    {
                                        min: 11,
                                        max: 50,
                                        pricePerUnit: 2.50
                                    },
                                    {
                                        min: 51,
                                        max: null,
                                        pricePerUnit: 2.00
                                    }
                                ]
                            }
                        ],
                        minimumSpend: 0,
                        billingFrequency: 'MONTHLY'
                    }
                },
                {
                    id: 'value',
                    name: 'Value-Based',
                    type: 'VALUE_BASED',
                    description: 'Pay based on value received',
                    enabled: true,
                    configurations: {
                        valueMetrics: [
                            {
                                id: 'time-saved',
                                name: 'Time Saved',
                                description: 'Hours saved using the platform',
                                unit: 'hour',
                                calculationMethod: 'Average document processing time * Documents processed',
                                dataSource: 'usage-metrics'
                            },
                            {
                                id: 'risk-reduction',
                                name: 'Risk Reduction',
                                description: 'Reduction in legal risk exposure',
                                unit: 'percentage',
                                calculationMethod: 'Issues identified / Total possible issues * 100',
                                dataSource: 'risk-assessment'
                            }
                        ],
                        valueTiers: [
                            {
                                metricId: 'time-saved',
                                percentage: 10,
                                minValue: 0,
                                maxValue: null,
                                capAmount: 10000
                            },
                            {
                                metricId: 'risk-reduction',
                                percentage: 5,
                                minValue: 0,
                                maxValue: null,
                                capAmount: 5000
                            }
                        ],
                        benchmarks: [],
                        reportingFrequency: 'MONTHLY'
                    }
                },
                {
                    id: 'hybrid',
                    name: 'Hybrid',
                    type: 'HYBRID',
                    description: 'Combination of multiple revenue models',
                    enabled: true,
                    configurations: {
                        baseModel: 'SUBSCRIPTION',
                        secondaryModels: ['USAGE_BASED', 'VALUE_BASED'],
                        weightDistribution: {
                            'SUBSCRIPTION': 0.6,
                            'USAGE_BASED': 0.3,
                            'VALUE_BASED': 0.1
                        }
                    }
                }
            ],
            activeModel: 'hybrid',
            pricingTiers: [
                {
                    id: 'starter',
                    name: 'Starter',
                    description: 'Basic legal document features',
                    basePrice: 49.99,
                    currency: 'USD',
                    features: [
                        {
                            id: 'document-analysis',
                            name: 'Document Analysis',
                            description: 'AI-powered document analysis',
                            included: true,
                            value: 10,
                            unit: 'documents/month'
                        },
                        {
                            id: 'document-generation',
                            name: 'Document Generation',
                            description: 'AI-powered document generation',
                            included: true,
                            value: 5,
                            unit: 'documents/month'
                        },
                        {
                            id: 'templates',
                            name: 'Templates',
                            description: 'Access to template library',
                            included: true,
                            value: 10,
                            unit: 'templates'
                        }
                    ],
                    limits: [
                        {
                            resource: 'document-size',
                            limit: 10,
                            unit: 'MB',
                            overage: {
                                price: 1.00,
                                per: 1,
                                unit: 'MB'
                            }
                        },
                        {
                            resource: 'storage',
                            limit: 5,
                            unit: 'GB',
                            overage: {
                                price: 0.50,
                                per: 1,
                                unit: 'GB'
                            }
                        }
                    ]
                },
                {
                    id: 'professional',
                    name: 'Professional',
                    description: 'Advanced legal document features',
                    basePrice: 99.99,
                    currency: 'USD',
                    features: [
                        {
                            id: 'document-analysis',
                            name: 'Document Analysis',
                            description: 'AI-powered document analysis',
                            included: true,
                            value: 50,
                            unit: 'documents/month'
                        },
                        {
                            id: 'document-generation',
                            name: 'Document Generation',
                            description: 'AI-powered document generation',
                            included: true,
                            value: 25,
                            unit: 'documents/month'
                        },
                        {
                            id: 'templates',
                            name: 'Templates',
                            description: 'Access to template library',
                            included: true,
                            value: 50,
                            unit: 'templates'
                        },
                        {
                            id: 'advanced-ai',
                            name: 'Advanced AI',
                            description: 'Advanced AI features',
                            included: true
                        }
                    ],
                    limits: [
                        {
                            resource: 'document-size',
                            limit: 50,
                            unit: 'MB',
                            overage: {
                                price: 0.75,
                                per: 1,
                                unit: 'MB'
                            }
                        },
                        {
                            resource: 'storage',
                            limit: 20,
                            unit: 'GB',
                            overage: {
                                price: 0.40,
                                per: 1,
                                unit: 'GB'
                            }
                        }
                    ]
                },
                {
                    id: 'enterprise',
                    name: 'Enterprise',
                    description: 'Enterprise-grade legal document features',
                    basePrice: 199.99,
                    currency: 'USD',
                    features: [
                        {
                            id: 'document-analysis',
                            name: 'Document Analysis',
                            description: 'AI-powered document analysis',
                            included: true,
                            value: 'Unlimited',
                            unit: 'documents/month'
                        },
                        {
                            id: 'document-generation',
                            name: 'Document Generation',
                            description: 'AI-powered document generation',
                            included: true,
                            value: 'Unlimited',
                            unit: 'documents/month'
                        },
                        {
                            id: 'templates',
                            name: 'Templates',
                            description: 'Access to template library',
                            included: true,
                            value: 'Unlimited',
                            unit: 'templates'
                        },
                        {
                            id: 'advanced-ai',
                            name: 'Advanced AI',
                            description: 'Advanced AI features',
                            included: true
                        },
                        {
                            id: 'priority-support',
                            name: 'Priority Support',
                            description: 'Priority customer support',
                            included: true
                        }
                    ],
                    limits: [
                        {
                            resource: 'document-size',
                            limit: 100,
                            unit: 'MB',
                            overage: {
                                price: 0.50,
                                per: 1,
                                unit: 'MB'
                            }
                        },
                        {
                            resource: 'storage',
                            limit: 100,
                            unit: 'GB',
                            overage: {
                                price: 0.30,
                                per: 1,
                                unit: 'GB'
                            }
                        }
                    ]
                }
            ],
            discounts: [
                {
                    id: 'annual',
                    name: 'Annual Subscription',
                    type: 'PERCENTAGE',
                    value: 16.67,
                    eligible: {
                        userTypes: ['all']
                    },
                    stackable: false
                },
                {
                    id: 'volume',
                    name: 'Volume Discount',
                    type: 'PERCENTAGE',
                    value: 10,
                    eligible: {
                        minSpend: 1000
                    },
                    stackable: true
                },
                {
                    id: 'nonprofit',
                    name: 'Nonprofit Discount',
                    type: 'PERCENTAGE',
                    value: 25,
                    eligible: {
                        userTypes: ['nonprofit']
                    },
                    stackable: true
                }
            ],
            taxRates: [
                {
                    id: 'us-ca',
                    name: 'California Sales Tax',
                    rate: 0.0725,
                    regions: ['US-CA']
                },
                {
                    id: 'us-ny',
                    name: 'New York Sales Tax',
                    rate: 0.0845,
                    regions: ['US-NY']
                },
                {
                    id: 'eu-vat',
                    name: 'EU VAT',
                    rate: 0.20,
                    regions: ['EU']
                }
            ],
            paymentMethods: [
                {
                    id: 'credit-card',
                    name: 'Credit Card',
                    type: 'CREDIT_CARD',
                    enabled: true,
                    processingFee: 2.9,
                    processingFeeType: 'PERCENTAGE'
                },
                {
                    id: 'bank-transfer',
                    name: 'Bank Transfer',
                    type: 'BANK_TRANSFER',
                    enabled: true,
                    processingFee: 0,
                    processingFeeType: 'FIXED'
                },
                {
                    id: 'paypal',
                    name: 'PayPal',
                    type: 'PAYPAL',
                    enabled: true,
                    processingFee: 3.5,
                    processingFeeType: 'PERCENTAGE'
                },
                {
                    id: 'crypto',
                    name: 'Cryptocurrency',
                    type: 'CRYPTO',
                    enabled: true,
                    processingFee: 1.0,
                    processingFeeType: 'PERCENTAGE'
                }
            ],
            billingCycle: {
                frequency: 'MONTHLY',
                dayOfMonth: 1,
                gracePeriod: 7,
                invoiceInAdvance: true
            }
        };
    }
    
    /**
     * Load revenue configuration
     */
    private async loadConfig(): Promise<void> {
        try {
            // In a real implementation, this would load the configuration from a database or file
            // For this example, we'll use the default configuration
            
            this.logger.info('Loaded revenue configuration');
        } catch (error) {
            this.logger.error('Failed to load revenue configuration', error);
            this.logger.info('Using default revenue configuration');
        }
    }
    
    /**
     * Handle customer created event
     * @param customer Customer data
     */
    private handleCustomerCreated(customer: any): void {
        try {
            this.logger.info(`Customer created: ${customer.id}`);
            
            // In a real implementation, this would set up the customer in the billing system
        } catch (error) {
            this.logger.error('Failed to handle customer created event', error);
        }
    }
    
    /**
     * Handle usage recorded event
     * @param usage Usage record
     */
    private handleUsageRecorded(usage: UsageRecord): void {
        try {
            this.logger.info(`Usage recorded: ${usage.customerId} - ${usage.metricId} - ${usage.quantity}`);
            
            // In a real implementation, this would update the customer's usage and potentially trigger billing
        } catch (error) {
            this.logger.error('Failed to handle usage recorded event', error);
        }
    }
    
    /**
     * Handle subscription changed event
     * @param subscription Subscription data
     */
    private handleSubscriptionChanged(subscription: any): void {
        try {
            this.logger.info(`Subscription changed: ${subscription.customerId} - ${subscription.planId}`);
            
            // In a real implementation, this would update the customer's subscription and potentially trigger billing
        } catch (error) {
            this.logger.error('Failed to handle subscription changed event', error);
        }
    }
    
    /**
     * Generate an invoice for a customer
     * @param data Invoice generation data containing customerId and billingPeriod
     * @returns Generated invoice
     */
    async generateInvoice(
        data: { customerId: string; billingPeriod: { start: Date; end: Date } }
    ): Promise<Invoice> {
        try {
            this.logger.info(`Generating invoice for customer: ${data.customerId}`);
            
            // In a real implementation, this would calculate usage, apply pricing, and generate an invoice
            // For this example, we'll return a placeholder invoice
            
            const invoice: Invoice = {
                id: `INV-${Date.now()}`,
                customerId: data.customerId,
                date: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Due in 30 days
                items: [
                    {
                        description: 'Subscription Fee',
                        quantity: 1,
                        unitPrice: 99.99,
                        amount: 99.99,
                        taxRate: 0.0,
                        discountAmount: 0.0,
                        period: data.billingPeriod
                    },
                    {
                        description: 'Document Analysis (35 documents)',
                        quantity: 35,
                        unitPrice: 3.00,
                        amount: 105.00,
                        taxRate: 0.0,
                        discountAmount: 0.0,
                        period: data.billingPeriod
                    }
                ],
                subtotal: 204.99,
                discountAmount: 0.0,
                taxAmount: 0.0,
                total: 204.99,
                status: 'DRAFT',
                paidAmount: 0.0
            };
            
            // Publish invoice generated event
            this.eventBus.publish('invoice.generated', invoice);
            
            return invoice;
        } catch (error) {
            this.logger.error('Failed to generate invoice', error);
            throw new Error(`Invoice generation failed: ${(error as Error).message}`);
        }
    }
    
    /**
     * Calculate pricing for usage
     * @param metricId Metric ID
     * @param quantity Usage quantity
     * @returns Calculated price
     */
    calculateUsagePrice(metricId: string, quantity: number): number {
        try {
            // Find the usage model
            const usageModel = this.config.models.find(model => 
                model.type === 'USAGE_BASED' && model.enabled
            );
            
            if (!usageModel) {
                throw new Error('No active usage-based model found');
            }
            
            const config = usageModel.configurations as UsageBasedConfig;
            
            // Find the tiers for the metric
            const metricTiers = config.tiers.find(tier => tier.metricId === metricId);
            
            if (!metricTiers) {
                throw new Error(`No tiers found for metric: ${metricId}`);
            }
            
            // Calculate the price based on the tiers
            let remainingQuantity = quantity;
            let totalPrice = 0;
            
            for (const tier of metricTiers.tierLevels) {
                const tierMin = tier.min;
                // Explicitly type tierMax to number
                const tierMax: number = tier.max === null ? Infinity : (tier.max as number);
                const tierRange = tierMax - tierMin;
                
                if (remainingQuantity <= 0) {
                    break;
                }
                
                if (remainingQuantity > 0 && tierMin <= quantity) {
                    const tierQuantity = Math.min(remainingQuantity, tierRange);
                    totalPrice += tierQuantity * tier.pricePerUnit;
                    remainingQuantity -= tierQuantity;
                    
                    if (tier.flatFee) {
                        totalPrice += tier.flatFee;
                    }
                }
            }
            
            return totalPrice;
        } catch (error) {
            this.logger.error('Failed to calculate usage price', error);
            throw new Error(`Usage price calculation failed: ${(error as Error).message}`);
        }
    }
    
    /**
     * Calculate value-based pricing
     * @param metricId Value metric ID
     * @param value Measured value
     * @returns Calculated price
     */
    calculateValuePrice(metricId: string, value: number): number {
        try {
            // Find the value-based model
            const valueModel = this.config.models.find(model => 
                model.type === 'VALUE_BASED' && model.enabled
            );
            
            if (!valueModel) {
                throw new Error('No active value-based model found');
            }
            
            const config = valueModel.configurations as ValueBasedConfig;
            
            // Find the tiers for the metric
            const metricTiers = config.valueTiers.filter(tier => tier.metricId === metricId);
            
            if (metricTiers.length === 0) {
                throw new Error(`No tiers found for value metric: ${metricId}`);
            }
            
            // Find the applicable tier
            const applicableTier = metricTiers.find(tier => 
                value >= tier.minValue && (tier.maxValue === undefined || value <= tier.maxValue)
            );
            
            if (!applicableTier) {
                throw new Error(`No applicable tier found for value: ${value}`);
            }
            
            // Calculate the price based on the percentage of value
            let price = value * (applicableTier.percentage / 100);
            
            // Apply cap if specified
            if (applicableTier.capAmount !== undefined && price > applicableTier.capAmount) {
                price = applicableTier.capAmount;
            }
            
            return price;
        } catch (error) {
            this.logger.error('Failed to calculate value price', error);
            throw new Error(`Value price calculation failed: ${(error as Error).message}`);
        }
    }
    
    /**
     * Apply discounts to a price
     * @param basePrice Base price
     * @param customerId Customer ID
     * @param productIds Product IDs
     * @param userType User type
     * @returns Price after discounts
     */
    applyDiscounts(
        basePrice: number,
        _customerId: string,
        productIds: string[],
        userType: string
    ): number {
        try {
            let discountedPrice = basePrice;
            const appliedDiscounts: Discount[] = [];
            
            // Get applicable discounts
            const applicableDiscounts = this.config.discounts.filter(discount => {
                // Check eligibility
                const eligible = discount.eligible;
                
                // Check user type
                if (eligible.userTypes && eligible.userTypes.length > 0 && 
                    eligible.userTypes[0] !== 'all' && 
                    !eligible.userTypes.includes(userType)) {
                    return false;
                }
                
                // Check minimum spend
                if (eligible.minSpend && basePrice < eligible.minSpend) {
                    return false;
                }
                
                // Check products
                if (eligible.products && eligible.products.length > 0 && 
                    !productIds.some(id => eligible.products!.includes(id))) {
                    return false;
                }
                
                // Check start and end dates
                const now = new Date();
                if (discount.startDate && discount.startDate > now) {
                    return false;
                }
                if (discount.endDate && discount.endDate < now) {
                    return false;
                }
                
                return true;
            });
            
            // Sort discounts by value (highest first)
            const sortedDiscounts = [...applicableDiscounts].sort((a, b) => {
                // Calculate effective value
                const valueA = a.type === 'PERCENTAGE' ? basePrice * (a.value / 100) : a.value;
                const valueB = b.type === 'PERCENTAGE' ? basePrice * (b.value / 100) : b.value;
                return valueB - valueA;
            });
            
            // Apply non-stackable discounts (take the best one)
            const nonStackable = sortedDiscounts.filter(d => !d.stackable);
            if (nonStackable.length > 0) {
                const bestDiscount = nonStackable[0];
                appliedDiscounts.push(bestDiscount);
                
                if (bestDiscount.type === 'PERCENTAGE') {
                    discountedPrice *= (1 - bestDiscount.value / 100);
                } else if (bestDiscount.type === 'FIXED') {
                    discountedPrice -= bestDiscount.value;
                }
            }
            
            // Apply stackable discounts
            const stackable = sortedDiscounts.filter(d => d.stackable);
            for (const discount of stackable) {
                appliedDiscounts.push(discount);
                
                if (discount.type === 'PERCENTAGE') {
                    discountedPrice *= (1 - discount.value / 100);
                } else if (discount.type === 'FIXED') {
                    discountedPrice -= discount.value;
                }
            }
            
            // Ensure price doesn't go below zero
            return Math.max(0, discountedPrice);
        } catch (error) {
            this.logger.error('Failed to apply discounts', error);
            return basePrice;
        }
    }
    
    /**
     * Record usage for a customer
     * @param customerId Customer ID
     * @param metricId Metric ID
     * @param quantity Usage quantity
     * @param metadata Additional metadata
     */
    async recordUsage(
        customerId: string,
        metricId: string,
        quantity: number,
        metadata: Record<string, any> = {}
    ): Promise<void> {
        try {
            this.logger.info(`Recording usage: ${customerId} - ${metricId} - ${quantity}`);
            
            // Create usage record
            const usageRecord: UsageRecord = {
                customerId,
                metricId,
                quantity,
                timestamp: new Date(),
                metadata
            };
            
            // In a real implementation, this would store the usage record in a database
            
            // Publish usage recorded event
            this.eventBus.publish('usage.recorded', usageRecord);
        } catch (error) {
            this.logger.error('Failed to record usage', error);
            throw new Error(`Usage recording failed: ${(error as Error).message}`);
        }
    }
    
    /**
     * Get revenue models
     * @returns Revenue models
     */
    getRevenueModels(): RevenueModel[] {
        return this.config.models;
    }
    
    /**
     * Get pricing tiers
     * @returns Pricing tiers
     */
    getPricingTiers(): PricingTier[] {
        return this.config.pricingTiers;
    }
    
    /**
     * Get active revenue model
     * @returns Active revenue model
     */
    getActiveRevenueModel(): RevenueModel {
        const activeModel = this.config.models.find(model => 
            model.id === this.config.activeModel
        );
        
        if (!activeModel) {
            throw new Error(`Active revenue model not found: ${this.config.activeModel}`);
        }
        
        return activeModel;
    }
    
    /**
     * Set active revenue model
     * @param modelId Revenue model ID
     */
    setActiveRevenueModel(modelId: string): void {
        const model = this.config.models.find(m => m.id === modelId);
        
        if (!model) {
            throw new Error(`Revenue model not found: ${modelId}`);
        }
        
        this.config.activeModel = modelId;
        
        // Publish event
        this.eventBus.publish('revenue.model.changed', {
            modelId,
            modelType: model.type
        });
    }
    
    /**
     * Dispose the revenue manager
     */
    dispose(): void {
        this.eventBus.unsubscribe('customer.created', 'revenue-customer-created');
        this.eventBus.unsubscribe('usage.recorded', 'revenue-usage-recorded');
        this.eventBus.unsubscribe('subscription.changed', 'revenue-subscription-changed');
        this.eventBus.unsubscribe('invoice.generate', 'revenue-invoice-generate');
    }
}
