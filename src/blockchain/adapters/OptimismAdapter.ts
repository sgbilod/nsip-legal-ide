/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import { IBlockchainAdapter } from './IBlockchainAdapter';
import { ethers } from 'ethers';
import { SmartContractTemplate } from '../models/SmartContractTemplate';

export class OptimismAdapter implements IBlockchainAdapter {
    private provider: ethers.providers.JsonRpcProvider;
    private signer: ethers.Signer;

    constructor(rpcUrl: string, privateKey: string) {
        this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        this.signer = new ethers.Wallet(privateKey, this.provider);
    }

    async deployContract(template: SmartContractTemplate, args: any[]): Promise<string> {
        const factory = new ethers.ContractFactory(
            template.abi,
            template.bytecode,
            this.signer
        );

        const contract = await factory.deploy(...args, {
            gasLimit: 5000000,
            gasPrice: await this.provider.getGasPrice()
        });
        await contract.deployed();

        return contract.address;
    }

    async getContract(address: string, abi: any): Promise<ethers.Contract> {
        return new ethers.Contract(address, abi, this.signer);
    }

    async getBalance(address: string): Promise<string> {
        const balance = await this.provider.getBalance(address);
        return ethers.utils.formatEther(balance);
    }

    async getBlockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }

    async getGasPrice(): Promise<string> {
        const gasPrice = await this.provider.getGasPrice();
        return ethers.utils.formatUnits(gasPrice, 'gwei');
    }

    async estimateGas(tx: any): Promise<string> {
        const gas = await this.provider.estimateGas(tx);
        return gas.toString();
    }

    async getTransactionReceipt(txHash: string): Promise<any> {
        return await this.provider.getTransactionReceipt(txHash);
    }

    async getNetworkInfo(): Promise<any> {
        const network = await this.provider.getNetwork();
        const blockNumber = await this.getBlockNumber();
        const gasPrice = await this.getGasPrice();

        return {
            name: network.name,
            chainId: network.chainId,
            blockNumber,
            gasPrice
        };
    }
}
