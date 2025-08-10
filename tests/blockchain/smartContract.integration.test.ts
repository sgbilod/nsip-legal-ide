/**
 * NSIP Legal/Business IDE VS Code Extension
 * Copyright (c) 2025 Stephen Bilodeau
 * All rights reserved.
 */

import { expect } from 'chai';
import { ethers } from 'ethers';
import { SmartContractManager } from '../../src/blockchain/smartContractManager';
import { ContractTemplateManager } from '../../src/blockchain/contractTemplateManager';
import { PolygonAdapter } from '../../src/blockchain/adapters/PolygonAdapter';

describe('Blockchain Integration Tests', () => {
    let contractManager: SmartContractManager;
    let templateManager: ContractTemplateManager;
    let blockchainAdapter: PolygonAdapter;

    // Test network configuration
    const TEST_RPC_URL = 'http://localhost:8545';
    const TEST_PRIVATE_KEY = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    before(async () => {
        blockchainAdapter = new PolygonAdapter(TEST_RPC_URL, TEST_PRIVATE_KEY);
        templateManager = new ContractTemplateManager();
        contractManager = new SmartContractManager(blockchainAdapter, templateManager);
    });

    describe('Contract Deployment', () => {
        it('should deploy a service agreement contract', async () => {
            const template = await templateManager.getTemplateByType('SERVICE_AGREEMENT');
            const deployArgs = [
                '0x1234567890123456789012345678901234567890',
                3,
                [1000, 2000, 3000],
                ['Phase 1', 'Phase 2', 'Phase 3']
            ];

            const contractAddress = await contractManager.deployContract(template, deployArgs);
            expect(contractAddress).to.match(/^0x[a-fA-F0-9]{40}$/);

            const contract = await blockchainAdapter.getContract(contractAddress, template.abi);
            const numMilestones = await contract.numMilestones();
            expect(numMilestones.toNumber()).to.equal(3);
        });

        it('should deploy a legal escrow contract', async () => {
            const template = await templateManager.getTemplateByType('LEGAL_ESCROW');
            const deployArgs = [
                '0x1234567890123456789012345678901234567890',
                '0x2234567890123456789012345678901234567890',
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Test Terms'))
            ];

            const contractAddress = await contractManager.deployContract(template, deployArgs);
            expect(contractAddress).to.match(/^0x[a-fA-F0-9]{40}$/);

            const contract = await blockchainAdapter.getContract(contractAddress, template.abi);
            const termsHash = await contract.termsHash();
            expect(termsHash).to.equal(deployArgs[2]);
        });
    });

    describe('Contract Interaction', () => {
        let serviceAgreementAddress: string;
        let escrowAddress: string;

        before(async () => {
            // Deploy test contracts
            const serviceTemplate = await templateManager.getTemplateByType('SERVICE_AGREEMENT');
            serviceAgreementAddress = await contractManager.deployContract(
                serviceTemplate,
                [
                    '0x1234567890123456789012345678901234567890',
                    2,
                    [1000, 2000],
                    ['Phase 1', 'Phase 2']
                ]
            );

            const escrowTemplate = await templateManager.getTemplateByType('LEGAL_ESCROW');
            escrowAddress = await contractManager.deployContract(
                escrowTemplate,
                [
                    '0x1234567890123456789012345678901234567890',
                    '0x2234567890123456789012345678901234567890',
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Test Terms'))
                ]
            );
        });

        it('should complete a milestone in service agreement', async () => {
            const template = await templateManager.getTemplateByType('SERVICE_AGREEMENT');
            const contract = await blockchainAdapter.getContract(serviceAgreementAddress, template.abi);
            
            await contract.completeMilestone(0);
            const milestoneInfo = await contract.getMilestoneInfo(0);
            expect(milestoneInfo.completed).to.be.true;
        });

        it('should fund and release escrow', async () => {
            const template = await templateManager.getTemplateByType('LEGAL_ESCROW');
            const contract = await blockchainAdapter.getContract(escrowAddress, template.abi);
            
            await contract.fund({ value: ethers.utils.parseEther('1.0') });
            const escrowInfo = await contract.getEscrowInfo();
            expect(escrowInfo._amount).to.equal(ethers.utils.parseEther('1.0'));

            await contract.release();
            const updatedInfo = await contract.getEscrowInfo();
            expect(updatedInfo._state).to.equal(2); // Released state
        });
    });

    describe('Network Information', () => {
        it('should retrieve network status', async () => {
            const networkInfo = await blockchainAdapter.getNetworkInfo();
            expect(networkInfo).to.have.property('name');
            expect(networkInfo).to.have.property('chainId');
            expect(networkInfo).to.have.property('blockNumber');
            expect(networkInfo).to.have.property('gasPrice');
        });

        it('should estimate gas for contract deployment', async () => {
            const template = await templateManager.getTemplateByType('SERVICE_AGREEMENT');
            const deployArgs = [
                '0x1234567890123456789012345678901234567890',
                2,
                [1000, 2000],
                ['Phase 1', 'Phase 2']
            ];

            const factory = new ethers.ContractFactory(
                template.abi,
                template.bytecode,
                new ethers.Wallet(TEST_PRIVATE_KEY)
            );

            const deployTx = factory.getDeployTransaction(...deployArgs);
            const gasEstimate = await blockchainAdapter.estimateGas(deployTx);
            expect(parseInt(gasEstimate)).to.be.greaterThan(0);
        });
    });
});
