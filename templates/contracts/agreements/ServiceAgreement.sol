// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ServiceAgreementContract
 * @dev Template for a service agreement between a service provider and a client
 * @custom:template-parameters
 * - providerName: Name of the service provider
 * - clientName: Name of the client
 * - serviceName: Name of the service being provided
 * - durationDays: Duration of the agreement in days
 * - paymentAmount: Amount to be paid for the service
 */
contract ServiceAgreementContract {
    address public provider;
    address public client;
    
    string public providerName;
    string public clientName;
    string public serviceName;
    uint256 public durationDays;
    uint256 public paymentAmount;
    
    uint256 public startDate;
    bool public isActive;
    bool public isCompleted;
    
    event AgreementSigned(address provider, address client, uint256 startDate);
    event ServiceDelivered(address provider, uint256 deliveryDate);
    event PaymentReleased(address client, address provider, uint256 amount);
    event DisputeRaised(address disputeInitiator, string reason);
    event DisputeResolved(bool resolved, string resolution);
    
    modifier onlyProvider() {
        require(msg.sender == provider, "Only the service provider can call this function");
        _;
    }
    
    modifier onlyClient() {
        require(msg.sender == client, "Only the client can call this function");
        _;
    }
    
    modifier activeAgreement() {
        require(isActive, "Agreement is not active");
        require(!isCompleted, "Agreement has been completed");
        _;
    }
    
    /**
     * @dev Initialize a new service agreement contract
     * @param _provider Address of the service provider
     * @param _client Address of the client
     * @param _providerName Name of the service provider
     * @param _clientName Name of the client
     * @param _serviceName Name of the service being provided
     * @param _durationDays Duration of the agreement in days
     * @param _paymentAmount Amount to be paid for the service
     */
    constructor(
        address _provider,
        address _client,
        string memory _providerName,
        string memory _clientName,
        string memory _serviceName,
        uint256 _durationDays,
        uint256 _paymentAmount
    ) {
        provider = _provider;
        client = _client;
        providerName = _providerName;
        clientName = _clientName;
        serviceName = _serviceName;
        durationDays = _durationDays;
        paymentAmount = _paymentAmount;
        
        // Initialize contract state
        isActive = false;
        isCompleted = false;
    }
    
    /**
     * @dev Sign and activate the agreement
     */
    function signAgreement() external payable onlyClient {
        require(!isActive, "Agreement is already active");
        require(msg.value == paymentAmount, "Payment amount does not match the agreed amount");
        
        isActive = true;
        startDate = block.timestamp;
        
        emit AgreementSigned(provider, client, startDate);
    }
    
    /**
     * @dev Mark the service as delivered
     */
    function deliverService() external onlyProvider activeAgreement {
        // Service delivery logic
        emit ServiceDelivered(provider, block.timestamp);
    }
    
    /**
     * @dev Release payment to the service provider
     */
    function releasePayment() external onlyClient activeAgreement {
        isCompleted = true;
        
        (bool success, ) = provider.call{value: paymentAmount}("");
        require(success, "Payment failed");
        
        emit PaymentReleased(client, provider, paymentAmount);
    }
    
    /**
     * @dev Raise a dispute with the agreement
     * @param reason The reason for the dispute
     */
    function raiseDispute(string memory reason) external activeAgreement {
        require(msg.sender == provider || msg.sender == client, "Only parties to the agreement can raise disputes");
        
        emit DisputeRaised(msg.sender, reason);
    }
    
    /**
     * @dev Resolve a dispute and release funds accordingly
     * @param providerPercentage Percentage of funds to release to provider (0-100)
     * @param resolution Description of the resolution
     */
    function resolveDispute(uint8 providerPercentage, string memory resolution) external {
        // In a real implementation, this would require an arbitrator
        require(providerPercentage <= 100, "Percentage must be between 0 and 100");
        
        isCompleted = true;
        
        uint256 providerAmount = (paymentAmount * providerPercentage) / 100;
        uint256 clientAmount = paymentAmount - providerAmount;
        
        if (providerAmount > 0) {
            (bool success1, ) = provider.call{value: providerAmount}("");
            require(success1, "Provider payment failed");
        }
        
        if (clientAmount > 0) {
            (bool success2, ) = client.call{value: clientAmount}("");
            require(success2, "Client refund failed");
        }
        
        emit DisputeResolved(true, resolution);
    }
    
    /**
     * @dev Get the current status of the agreement
     * @return status Current status as a string
     */
    function getAgreementStatus() external view returns (string memory status) {
        if (!isActive) {
            return "Pending";
        } else if (isCompleted) {
            return "Completed";
        } else if (block.timestamp > startDate + (durationDays * 1 days)) {
            return "Expired";
        } else {
            return "Active";
        }
    }
}
