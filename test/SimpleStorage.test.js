const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  let simpleStorage;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await simpleStorage.owner()).to.equal(owner.address);
    });

    it("Should start with value 0", async function () {
      expect(await simpleStorage.get()).to.equal(0);
    });
  });

  describe("Storage operations", function () {
    it("Should store and retrieve value", async function () {
      await simpleStorage.set(42);
      expect(await simpleStorage.get()).to.equal(42);
    });

    it("Should emit event on set", async function () {
      await expect(simpleStorage.set(42))
        .to.emit(simpleStorage, "ValueStored")
        .withArgs(owner.address, 42);
    });

    it("Should allow owner to reset", async function () {
      await simpleStorage.set(100);
      await simpleStorage.reset();
      expect(await simpleStorage.get()).to.equal(0);
    });

    it("Should not allow non-owner to reset", async function () {
      await simpleStorage.set(100);
      await expect(simpleStorage.connect(addr1).reset())
        .to.be.revertedWith("Only owner can reset");
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      await simpleStorage.transferOwnership(addr1.address);
      expect(await simpleStorage.owner()).to.equal(addr1.address);
    });

    it("Should not transfer to zero address", async function () {
      await expect(simpleStorage.transferOwnership(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid address");
    });

    it("Should only allow owner to transfer", async function () {
      await expect(simpleStorage.connect(addr1).transferOwnership(addr2.address))
        .to.be.revertedWith("Only owner can transfer");
    });
  });
});
