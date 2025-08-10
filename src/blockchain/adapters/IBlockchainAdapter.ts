/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

export interface IBlockchainAdapter {
    deployContract(template: any, args: any[]): Promise<string>;
    getContract(address: string, abi: any): Promise<any>;
    getBalance(address: string): Promise<string>;
    getBlockNumber(): Promise<number>;
    getGasPrice(): Promise<string>;
    estimateGas(tx: any): Promise<string>;
    getTransactionReceipt(txHash: string): Promise<any>;
    getNetworkInfo(): Promise<any>;
}
