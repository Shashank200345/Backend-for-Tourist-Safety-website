// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TouristIdentity
 * @dev Smart contract for storing and managing tourist identity records on blockchain
 * @notice This contract stores tourist records with document hashes for verification
 */
contract TouristIdentity {
    // Struct to store tourist record
    struct TouristRecord {
        string touristId;
        string documentHash;
        uint256 timestamp;
        address issuer;
        bool isValid;
    }

    // Mapping from touristId to TouristRecord
    mapping(string => TouristRecord) public records;

    // Owner of the contract
    address public owner;

    // Events
    event RecordCreated(
        string indexed touristId,
        string documentHash,
        address issuer,
        uint256 timestamp
    );

    event RecordVerified(
        string indexed touristId,
        bool isValid
    );

    event RecordInvalidated(
        string indexed touristId,
        address issuer,
        uint256 timestamp
    );

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier recordExists(string memory touristId) {
        require(
            bytes(records[touristId].touristId).length > 0,
            "Record does not exist"
        );
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Create a new tourist record
     * @param touristId Unique tourist identifier
     * @param docHash Hash of the tourist's document
     */
    function createRecord(
        string memory touristId,
        string memory docHash
    ) public {
        require(
            bytes(records[touristId].touristId).length == 0,
            "Record already exists"
        );
        require(bytes(touristId).length > 0, "Tourist ID cannot be empty");
        require(bytes(docHash).length > 0, "Document hash cannot be empty");

        records[touristId] = TouristRecord({
            touristId: touristId,
            documentHash: docHash,
            timestamp: block.timestamp,
            issuer: msg.sender,
            isValid: true
        });

        emit RecordCreated(touristId, docHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify if a tourist record is valid
     * @param touristId Unique tourist identifier
     * @return bool True if record exists and is valid
     */
    function verifyRecord(string memory touristId) public view returns (bool) {
        TouristRecord memory record = records[touristId];
        return (
            bytes(record.touristId).length > 0 && record.isValid
        );
    }

    /**
     * @dev Get complete record details
     * @param touristId Unique tourist identifier
     * @return documentHash Hash of the document
     * @return timestamp When the record was created
     * @return isValid Whether the record is currently valid
     */
    function getRecord(
        string memory touristId
    )
        public
        view
        returns (
            string memory documentHash,
            uint256 timestamp,
            bool isValid
        )
    {
        TouristRecord memory record = records[touristId];
        require(
            bytes(record.touristId).length > 0,
            "Record does not exist"
        );

        return (record.documentHash, record.timestamp, record.isValid);
    }

    /**
     * @dev Invalidate a tourist record (only owner)
     * @param touristId Unique tourist identifier
     */
    function invalidateRecord(string memory touristId) public onlyOwner {
        require(
            bytes(records[touristId].touristId).length > 0,
            "Record does not exist"
        );

        records[touristId].isValid = false;

        emit RecordInvalidated(touristId, msg.sender, block.timestamp);
    }

    /**
     * @dev Batch invalidate multiple records (only owner)
     * @param touristIds Array of tourist IDs to invalidate
     */
    function batchInvalidate(string[] memory touristIds) public onlyOwner {
        for (uint256 i = 0; i < touristIds.length; i++) {
            if (bytes(records[touristIds[i]].touristId).length > 0) {
                records[touristIds[i]].isValid = false;
                emit RecordInvalidated(
                    touristIds[i],
                    msg.sender,
                    block.timestamp
                );
            }
        }
    }

    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}



