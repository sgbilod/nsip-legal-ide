/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

export interface ChainConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    blockExplorer: string;
    contracts: {
        [key: string]: string;  // contract name to address mapping
    };
    options: {
        gasPrice?: string;
        gasLimit?: number;
        confirmations?: number;
    };
}
