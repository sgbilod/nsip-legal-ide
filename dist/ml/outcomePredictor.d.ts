/**
 * Legal Outcome Prediction Engine
 *
 * This module provides advanced predictive analytics for legal outcomes
 * using ensemble learning techniques across multiple ML models.
 */
import { LegalCase, OutcomePrediction } from './interfaces';
import { IService } from '../core/interfaces';
/**
 * Legal Outcome Predictor implementation
 *
 * Provides comprehensive legal outcome prediction using an ensemble
 * of specialized models and advanced ML techniques.
 */
export declare class LegalOutcomePredictor implements IService {
    private models;
    private xgboostModel;
    private neuralNetwork;
    private bayesianModel;
    /**
     * Initialize the outcome predictor service
     */
    initialize(): Promise<void>;
    /**
     * Dispose the service resources
     */
    dispose(): Promise<void>;
    /**
     * Predict the outcome of a legal case
     *
     * @param case The legal case to predict
     * @returns A comprehensive outcome prediction
     */
    predictOutcome(legalCase: LegalCase): Promise<OutcomePrediction>;
    /**
     * Extract features from a legal case
     */
    private extractFeatures;
    /**
     * Get prediction from the primary specialized model based on case type
     */
    private getPrimaryModelPrediction;
    /**
     * Run neural network prediction
     */
    private runNeuralNetwork;
    /**
     * Run XGBoost prediction
     */
    private runXGBoost;
    /**
     * Run Bayesian model prediction
     */
    private runBayesianModel;
    /**
     * Combine predictions from multiple models using weighted voting
     */
    private ensemblePredictions;
    /**
     * Calculate confidence statistics from predictions
     */
    private calculateConfidence;
    /**
     * Explain the prediction by identifying key factors
     */
    private explainPrediction;
    /**
     * Find similar cases to provide context for the prediction
     */
    private findSimilarCases;
    /**
     * Generate strategic recommendations based on the prediction
     */
    private generateRecommendations;
    /**
     * Event handler for case updated events
     */
    private handleCaseUpdated;
}
