import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Blockchain Configuration
export const blockchainConfig = {
  network: process.env.BLOCKCHAIN_NETWORK || 'polygon-mumbai',
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || '',
  privateKey: process.env.PRIVATE_KEY || '',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
};

// Initialize Ethereum Provider (only if RPC URL is provided)
export const provider = blockchainConfig.rpcUrl 
  ? new ethers.JsonRpcProvider(blockchainConfig.rpcUrl)
  : null;

// Initialize Wallet (only if private key and provider are available)
export const wallet = blockchainConfig.privateKey && provider
  ? new ethers.Wallet(blockchainConfig.privateKey, provider)
  : null;

// Smart Contract ABI - Complete ABI including all functions from TouristIdentity.sol
export const contractABI = [
  // Events
  'event RecordCreated(string indexed touristId, string documentHash, address issuer, uint256 timestamp)',
  'event RecordVerified(string indexed touristId, bool isValid)',
  'event RecordInvalidated(string indexed touristId, address issuer, uint256 timestamp)',
  
  // Functions
  'function createRecord(string memory touristId, string memory docHash) public',
  'function verifyRecord(string memory touristId) public view returns (bool)',
  'function invalidateRecord(string memory touristId) public',
  'function getRecord(string memory touristId) public view returns (string memory documentHash, uint256 timestamp, bool isValid)',
  'function batchInvalidate(string[] memory touristIds) public',
  'function owner() public view returns (address)',
  'function records(string memory) public view returns (string memory touristId, string memory documentHash, uint256 timestamp, address issuer, bool isValid)',
];

// Initialize Contract (only if all required config is available)
export const contract = blockchainConfig.contractAddress && wallet
  ? new ethers.Contract(
      blockchainConfig.contractAddress,
      contractABI,
      wallet
    )
  : null;


