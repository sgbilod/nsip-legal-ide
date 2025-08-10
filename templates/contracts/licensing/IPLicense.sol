// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IPLicenseContract
 * @dev Template for an intellectual property licensing agreement
 * @author Stephen Bilodeau
 * @custom:template-parameters
 * - licensor: Address of the IP owner/licensor
 * - licensee: Address of the licensee
 * - ipName: Name of the intellectual property
 * - licenseType: Type of license (exclusive, non-exclusive, etc.)
 * - durationMonths: Duration of the license in months
 * - licenseFee: License fee amount
 * - royaltyPercentage: Percentage of royalties (0-100)
 */
contract IPLicenseContract {
    address payable public licensor;
    address payable public licensee;
    
    string public ipName;
    string public licenseType;
    uint256 public durationMonths;
    uint256 public licenseFee;
    uint256 public royaltyPercentage;
    
    uint256 public startDate;
    uint256 public endDate;
    bool public isActive;
    bool public isTerminated;
    
    mapping(uint256 => uint256) public royaltyPayments;
    uint256 public totalRoyaltiesPaid;
    uint256 public royaltyPaymentCount;
    
    event LicenseActivated(address licensor, address licensee, uint256 startDate, uint256 endDate);
    event RoyaltyPaid(address licensee, uint256 amount, uint256 paymentId);
    event LicenseTerminated(address terminator, string reason);
    event LicenseRenewed(uint256 newEndDate, uint256 renewalFee);
    event DisputeRaised(address disputeInitiator, string reason);
    event DisputeResolved(string resolution);
    
    modifier onlyLicensor() {
        require(msg.sender == licensor, "Only the licensor can call this function");
        _;
    }
    
    modifier onlyLicensee() {
        require(msg.sender == licensee, "Only the licensee can call this function");
        _;
    }
    
    modifier activeLicense() {
        require(isActive, "License is not active");
        require(!isTerminated, "License has been terminated");
        require(block.timestamp <= endDate, "License has expired");
        _;
    }
    
    /**
     * @dev Initialize a new IP license contract
     * @param _licensor Address of the IP owner/licensor
     * @param _licensee Address of the licensee
     * @param _ipName Name of the intellectual property
     * @param _licenseType Type of license (exclusive, non-exclusive, etc.)
     * @param _durationMonths Duration of the license in months
     * @param _licenseFee License fee amount
     * @param _royaltyPercentage Percentage of royalties (0-100)
     */
    constructor(
        address payable _licensor,
        address payable _licensee,
        string memory _ipName,
        string memory _licenseType,
        uint256 _durationMonths,
        uint256 _licenseFee,
        uint256 _royaltyPercentage
    ) {
        require(_royaltyPercentage <= 100, "Royalty percentage must be between 0 and 100");
        
        licensor = _licensor;
        licensee = _licensee;
        ipName = _ipName;
        licenseType = _licenseType;
        durationMonths = _durationMonths;
        licenseFee = _licenseFee;
        royaltyPercentage = _royaltyPercentage;
        
        // Initialize contract state
        isActive = false;
        isTerminated = false;
        totalRoyaltiesPaid = 0;
        royaltyPaymentCount = 0;
    }
    
    /**
     * @dev Activate the license by paying the license fee
     */
    function activateLicense() external payable onlyLicensee {
        require(!isActive, "License is already active");
        require(msg.value == licenseFee, "Payment does not match license fee");
        
        isActive = true;
        startDate = block.timestamp;
        endDate = startDate + (durationMonths * 30 days);
        
        (bool success, ) = licensor.call{value: licenseFee}("");
        require(success, "License fee payment failed");
        
        emit LicenseActivated(licensor, licensee, startDate, endDate);
    }
    
    /**
     * @dev Pay royalties based on reported revenue
     * @param reportedRevenue The revenue to calculate royalties from
     */
    function payRoyalty(uint256 reportedRevenue) external payable onlyLicensee activeLicense {
        uint256 expectedRoyalty = (reportedRevenue * royaltyPercentage) / 100;
        require(msg.value == expectedRoyalty, "Payment does not match expected royalty");
        
        royaltyPaymentCount++;
        royaltyPayments[royaltyPaymentCount] = msg.value;
        totalRoyaltiesPaid += msg.value;
        
        (bool success, ) = licensor.call{value: msg.value}("");
        require(success, "Royalty payment failed");
        
        emit RoyaltyPaid(licensee, msg.value, royaltyPaymentCount);
    }
    
    /**
     * @dev Terminate the license agreement
     * @param reason Reason for termination
     */
    function terminateLicense(string memory reason) external activeLicense {
        require(msg.sender == licensor || msg.sender == licensee, "Only parties to the license can terminate");
        
        isTerminated = true;
        
        emit LicenseTerminated(msg.sender, reason);
    }
    
    /**
     * @dev Renew the license for another term
     * @param additionalMonths Number of additional months to renew
     */
    function renewLicense(uint256 additionalMonths) external payable onlyLicensee {
        require(isActive && !isTerminated, "License cannot be renewed");
        
        uint256 renewalFee = (licenseFee * additionalMonths) / durationMonths;
        require(msg.value == renewalFee, "Payment does not match renewal fee");
        
        endDate = endDate + (additionalMonths * 30 days);
        
        (bool success, ) = licensor.call{value: renewalFee}("");
        require(success, "Renewal fee payment failed");
        
        emit LicenseRenewed(endDate, renewalFee);
    }
    
    /**
     * @dev Raise a dispute regarding the license
     * @param reason Reason for the dispute
     */
    function raiseDispute(string memory reason) external activeLicense {
        require(msg.sender == licensor || msg.sender == licensee, "Only parties to the license can raise disputes");
        
        emit DisputeRaised(msg.sender, reason);
    }
    
    /**
     * @dev Get the current status of the license
     * @return status Current status as a string
     */
    function getLicenseStatus() external view returns (string memory status) {
        if (!isActive) {
            return "Pending Activation";
        } else if (isTerminated) {
            return "Terminated";
        } else if (block.timestamp > endDate) {
            return "Expired";
        } else {
            return "Active";
        }
    }
    
    /**
     * @dev Get license details
     * @return _startDate Start date of the license
     * @return _endDate End date of the license
     * @return _totalRoyaltiesPaid Total royalties paid so far
     * @return _royaltyPaymentCount Number of royalty payments made
     */
    function getLicenseDetails() external view returns (
        uint256 _startDate,
        uint256 _endDate,
        uint256 _totalRoyaltiesPaid,
        uint256 _royaltyPaymentCount
    ) {
        return (startDate, endDate, totalRoyaltiesPaid, royaltyPaymentCount);
    }
}
