const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { expect } = require("chai");
const { advanceBlockTo, latestBlock, advanceBlock } = require("./utils");

describe('SAT', () => {
    let
        // Used as default deployer for contracts, asks as owner of contracts.
        deployer,
        addr1,
        addr2,
        addr3,
        addr4,
        addr5,
        addr6,
        SAT,
        sat;

    const AMOUNT = '1000000000000000000000';

    beforeEach(async function () {
        [deployer, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

        SAT = await ethers.getContractFactory('SATERC20Token');
        sat = await SAT.deploy();
        await sat.setVault(deployer.address);
    });

    describe('mint()', () => {
        it('should NOT allow users to mint', async () => {
            await expect(sat.connect(addr1).mint(deployer.address, AMOUNT)).to.be.revertedWith('VaultOwned: caller is not the Vault');
            await expect(sat.connect(addr2).mint(deployer.address, AMOUNT)).to.be.revertedWith('VaultOwned: caller is not the Vault');
        });

        it('should allow Vault to mint', async () => {
            await sat.mint(deployer.address, AMOUNT);
            await sat.mint(addr1.address, AMOUNT);

            expect(await sat.balanceOf(deployer.address)).to.equal(BigInt(AMOUNT));
            expect(await sat.balanceOf(addr1.address)).to.equal(BigInt(AMOUNT));
        });
    });

    describe('transfer()', () => {
        beforeEach(async function () {
            await sat.mint(deployer.address, AMOUNT);
            await sat.mint(addr1.address, AMOUNT);
        });

        it('should allow users to transfer', async () => {
            await sat.transfer(addr2.address, AMOUNT);

            expect(await sat.balanceOf(deployer.address)).to.equal(0n);
            expect(await sat.balanceOf(addr2.address)).to.equal(BigInt(AMOUNT));
        });

        it('should allow users to transfer when PAUSED', async () => {
            await sat.pauseTransfer();
            await expect(sat.transfer(addr2.address, AMOUNT)).to.be.revertedWith('ERC20Pausable: token transfer while paused');
        });

        it('should allow whitelist to transfer when PAUSED', async () => {
            await sat.pauseTransfer();
            await expect(sat.transfer(addr2.address, AMOUNT)).to.be.revertedWith('ERC20Pausable: token transfer while paused');

            await sat.addWhitelist(deployer.address);
            await sat.transfer(addr2.address, AMOUNT);

            expect(await sat.balanceOf(deployer.address)).to.equal(0n);
            expect(await sat.balanceOf(addr2.address)).to.equal(BigInt(AMOUNT));
        });

        it('should UNPAUSED', async () => {
            await sat.pauseTransfer();
            await expect(sat.transfer(addr2.address, AMOUNT)).to.be.revertedWith('ERC20Pausable: token transfer while paused');
            await advanceBlock(10);

            await sat.unpauseTransfer();
            await sat.transfer(addr2.address, AMOUNT);

            expect(await sat.balanceOf(deployer.address)).to.equal(0n);
            expect(await sat.balanceOf(addr2.address)).to.equal(BigInt(AMOUNT));
        });
    });

});
