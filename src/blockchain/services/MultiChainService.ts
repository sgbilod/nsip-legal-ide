/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import { ChainConfig } from '../models/ChainConfig';
import { ethers } from 'ethers';

export class MultiChainService {
    private providers: Map<number, ethers.providers.JsonRpcProvider>;
    private configs: Map<number, ChainConfig>;

    constructor() {
        this.providers = new Map();
        this.configs = new Map();
    }

    public async addChain(config: ChainConfig): Promise<void> {
        try {
            const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
            this.providers.set(config.chainId, provider);
            this.configs.set(config.chainId, config);
        } catch (error) {
            console.error(`Error adding chain ${config.name}:`, error);
            throw new Error(`Failed to add chain ${config.name}`);
        }
    }

    public async getProvider(chainId: number): Promise<ethers.providers.JsonRpcProvider> {
        const provider = this.providers.get(chainId);
        if (!provider) {
            throw new Error(`Provider not found for chain ID ${chainId}`);
        }
        return provider;
    }

    public async getConfig(chainId: number): Promise<ChainConfig> {
        const config = this.configs.get(chainId);
        if (!config) {
            throw new Error(`Configuration not found for chain ID ${chainId}`);
        }
        return config;
    }
}
