// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title LegalEscrowContract
 * @dev Template for an escrow contract for legal transactions
 * @custom:template-parameters
 * - seller: Address of the seller
 * - buyer: Address of the buyer
 * - amount: Escrow amount
 * - transactionDescription: Description of the transaction
 * - arbitratorFeePercentage: Percentage fee for arbitration (0-10)
 */
contract LegalEscrowContract {
    address payable public seller;
    address payable public buyer;
    address payable public arbitrator;
    
    uint256 public amount;
    string public transactionDescription;
    uint256 public arbitratorFeePercentage;
    
    bool public isFunded;
    bool public isReleased;
    bool public isRefunded;
    bool public isDisputed;
    
    event Funded(address buyer, uint256 amount);
    event Released(address seller, uint256 amount);
    event Refunded(address buyer, uint256 amount);
    event DisputeRaised(address initiator, string reason);
    event DisputeResolved(address arbitrator, uint256 sellerAmount, uint256 buyerAmount, string resolution);
    
    modifier onlySeller() {
        require(msg.sender == seller, "Only the seller can call this function");
        _;
    }
    
    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only the buyer can call this function");
        _;
    }
    
    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only the arbitrator can call this function");
        _;
    }
    
    modifier canRelease() {
        require(isFunded, "Escrow not funded");
        require(!isReleased, "Funds already released");
        require(!isRefunded, "Funds already refunded");
        require(!isDisputed, "Dispute in progress");
        _;
    }
    
    /**
     * @dev Initialize a new escrow contract
     * @param _seller Address of the seller
     * @param _buyer Address of the buyer
     * @param _arbitrator Address of the arbitrator
     * @param _transactionDescription Description of the transaction
     * @param _arbitratorFeePercentage Percentage fee for arbitration (0-10)
     */
    constructor(
        address payable _seller,
        address payable _buyer,
        address payable _arbitrator,
        string memory _transactionDescription,
        uint256 _arbitratorFeePercentage
    ) {
        require(_arbitratorFeePercentage <= 10, "Arbitrator fee too high");
        
        seller = _seller;
        buyer = _buyer;
        arbitrator = _arbitrator;
        transactionDescription = _transactionDescription;
        arbitratorFeePercentage = _arbitratorFeePercentage;
        
        isFunded = false;
        isReleased = false;
        isRefunded = false;
        isDisputed = false;
    }
    
    /**
     * @dev Fund the escrow
     */
    function fundEscrow() external payable onlyBuyer {
        require(!isFunded, "Escrow already funded");
        require(msg.value > 0, "Amount must be greater than 0");
        
        amount = msg.value;
        isFunded = true;
        
        emit Funded(buyer, amount);
    }
    
    /**
     * @dev Release funds to the seller
     */
    function releaseFunds() external onlyBuyer canRelease {
        isReleased = true;
        
        (bool success, ) = seller.call{value: amount}("");
        require(success, "Release failed");
        
        emit Released(seller, amount);
    }
    
    /**
     * @dev Refund to the buyer
     */
    function refund() external onlySeller canRelease {
        isRefunded = true;
        
        (bool success, ) = buyer.call{value: amount}("");
        require(success, "Refund failed");
        
        emit Refunded(buyer, amount);
    }
    
    /**
     * @dev Raise a dispute
     * @param reason The reason for the dispute
     */
    function raiseDispute(string memory reason) external canRelease {
        require(msg.sender == buyer || msg.sender == seller, "Only transaction parties can raise disputes");
        
        isDisputed = true;
        
        emit DisputeRaised(msg.sender, reason);
    }
    
    /**
     * @dev Resolve a dispute
     * @param sellerPercentage Percentage of funds to release to seller (0-100)
     * @param resolution Description of the resolution
     */
    function resolveDispute(uint8 sellerPercentage, string memory resolution) external onlyArbitrator {
        require(isDisputed, "No dispute to resolve");
        require(!isReleased && !isRefunded, "Funds already released or refunded");
        require(sellerPercentage <= 100, "Percentage must be between 0 and 100");
        
        uint256 arbitratorFee = (amount * arbitratorFeePercentage) / 100;
        uint256 remainingAmount = amount - arbitratorFee;
        
        uint256 sellerAmount = (remainingAmount * sellerPercentage) / 100;
        uint256 buyerAmount = remainingAmount - sellerAmount;
        
        // Release to arbitrator
        if (arbitratorFee > 0) {
            (bool successArb, ) = arbitrator.call{value: arbitratorFee}("");
            require(successArb, "Arbitrator fee payment failed");
        }
        
        // Release to seller
        if (sellerAmount > 0) {
            (bool successSeller, ) = seller.call{value: sellerAmount}("");
            require(successSeller, "Seller payment failed");
        }
        
        // Release to buyer
        if (buyerAmount > 0) {
            (bool successBuyer, ) = buyer.call{value: buyerAmount}("");
            require(successBuyer, "Buyer payment failed");
        }
        
        isReleased = true;
        isDisputed = false;
        
        emit DisputeResolved(arbitrator, sellerAmount, buyerAmount, resolution);
    }
    
    /**
     * @dev Get the current status of the escrow
     * @return status Current status as a string
     */
    function getEscrowStatus() external view returns (string memory status) {
        if (!isFunded) {
            return "Awaiting Funding";
        } else if (isReleased) {
            return "Funds Released";
        } else if (isRefunded) {
            return "Funds Refunded";
        } else if (isDisputed) {
            return "In Dispute";
        } else {
            return "Funded";
        }
    }
}
