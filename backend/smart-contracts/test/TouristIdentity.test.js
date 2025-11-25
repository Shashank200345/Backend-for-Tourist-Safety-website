const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TouristIdentity", function () {
  let touristIdentity;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    const TouristIdentity = await ethers.getContractFactory("TouristIdentity");
    touristIdentity = await TouristIdentity.deploy();
    await touristIdentity.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await touristIdentity.owner()).to.equal(owner.address);
    });

    it("Should have correct contract address", async function () {
      const address = await touristIdentity.getAddress();
      expect(address).to.be.properAddress;
    });
  });

  describe("Record Creation", function () {
    it("Should create a new record", async function () {
      const touristId = "TID-DEL-12345";
      const docHash = "0xabc123def456";

      await expect(touristIdentity.createRecord(touristId, docHash))
        .to.emit(touristIdentity, "RecordCreated")
        .withArgs(touristId, docHash, owner.address, (value) => {
          // Check that timestamp is a valid number
          return typeof value === 'bigint' && value > 0n;
        });

      const record = await touristIdentity.getRecord(touristId);
      expect(record.documentHash).to.equal(docHash);
      expect(record.isValid).to.equal(true);
    });

    it("Should fail if record already exists", async function () {
      const touristId = "TID-DEL-12345";
      const docHash = "0xabc123";

      await touristIdentity.createRecord(touristId, docHash);
      
      await expect(
        touristIdentity.createRecord(touristId, docHash)
      ).to.be.revertedWith("Record already exists");
    });

    it("Should fail if tourist ID is empty", async function () {
      await expect(
        touristIdentity.createRecord("", "0xabc123")
      ).to.be.revertedWith("Tourist ID cannot be empty");
    });

    it("Should fail if document hash is empty", async function () {
      await expect(
        touristIdentity.createRecord("TID-DEL-12345", "")
      ).to.be.revertedWith("Document hash cannot be empty");
    });

    it("Should allow anyone to create records", async function () {
      const touristId = "TID-DEL-99999";
      const docHash = "0x999999";

      await expect(
        touristIdentity.connect(addr1).createRecord(touristId, docHash)
      ).to.emit(touristIdentity, "RecordCreated");

      // Get record using the mapping directly
      const record = await touristIdentity.records(touristId);
      expect(record.issuer).to.equal(addr1.address);
    });
  });

  describe("Record Verification", function () {
    it("Should verify valid record", async function () {
      const touristId = "TID-DEL-12345";
      const docHash = "0xabc123";

      await touristIdentity.createRecord(touristId, docHash);
      const isValid = await touristIdentity.verifyRecord(touristId);
      
      expect(isValid).to.equal(true);
    });

    it("Should return false for non-existent record", async function () {
      const isValid = await touristIdentity.verifyRecord("NONEXISTENT");
      expect(isValid).to.equal(false);
    });

    it("Should return false for invalidated record", async function () {
      const touristId = "TID-DEL-12345";
      const docHash = "0xabc123";

      await touristIdentity.createRecord(touristId, docHash);
      await touristIdentity.invalidateRecord(touristId);

      const isValid = await touristIdentity.verifyRecord(touristId);
      expect(isValid).to.equal(false);
    });
  });

  describe("Get Record", function () {
    it("Should return correct record details", async function () {
      const touristId = "TID-DEL-12345";
      const docHash = "0xabc123";

      await touristIdentity.createRecord(touristId, docHash);
      const record = await touristIdentity.getRecord(touristId);

      expect(record.documentHash).to.equal(docHash);
      expect(record.isValid).to.equal(true);
      expect(record.timestamp).to.be.gt(0);
    });

    it("Should fail if record does not exist", async function () {
      await expect(
        touristIdentity.getRecord("NONEXISTENT")
      ).to.be.revertedWith("Record does not exist");
    });
  });

  describe("Record Invalidation", function () {
    it("Should invalidate record (owner only)", async function () {
      const touristId = "TID-DEL-12345";
      const docHash = "0xabc123";

      await touristIdentity.createRecord(touristId, docHash);
      
      await expect(touristIdentity.invalidateRecord(touristId))
        .to.emit(touristIdentity, "RecordInvalidated");

      const isValid = await touristIdentity.verifyRecord(touristId);
      expect(isValid).to.equal(false);
    });

    it("Should fail if non-owner tries to invalidate", async function () {
      const touristId = "TID-DEL-12345";
      const docHash = "0xabc123";

      await touristIdentity.createRecord(touristId, docHash);
      
      await expect(
        touristIdentity.connect(addr1).invalidateRecord(touristId)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should fail if record does not exist", async function () {
      await expect(
        touristIdentity.invalidateRecord("NONEXISTENT")
      ).to.be.revertedWith("Record does not exist");
    });
  });

  describe("Batch Invalidation", function () {
    it("Should invalidate multiple records", async function () {
      const touristIds = ["TID-DEL-1", "TID-DEL-2", "TID-DEL-3"];
      const docHash = "0xabc123";

      // Create records
      for (const id of touristIds) {
        await touristIdentity.createRecord(id, docHash);
      }

      // Invalidate all
      await touristIdentity.batchInvalidate(touristIds);

      // Verify all are invalid
      for (const id of touristIds) {
        const isValid = await touristIdentity.verifyRecord(id);
        expect(isValid).to.equal(false);
      }
    });

    it("Should only invalidate existing records", async function () {
      const touristIds = ["TID-DEL-1", "NONEXISTENT", "TID-DEL-3"];
      const docHash = "0xabc123";

      await touristIdentity.createRecord("TID-DEL-1", docHash);
      await touristIdentity.createRecord("TID-DEL-3", docHash);

      // Should not revert, just skip non-existent
      await expect(
        touristIdentity.batchInvalidate(touristIds)
      ).to.not.be.reverted;
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      await touristIdentity.transferOwnership(addr1.address);
      expect(await touristIdentity.owner()).to.equal(addr1.address);
    });

    it("Should fail if non-owner tries to transfer", async function () {
      await expect(
        touristIdentity.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should fail if new owner is zero address", async function () {
      await expect(
        touristIdentity.transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("New owner cannot be zero address");
    });
  });
});

