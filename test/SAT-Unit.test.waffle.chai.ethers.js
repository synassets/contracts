const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { expect } = require("chai");
const { advanceBlockTo, latestBlock, advanceBlock ,latest,increase} = require("./utils");
const {getLast} = require("prettier-plugin-solidity/src/prettier-comments/common/util");
const BN = require("bn.js");

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
        proxyDeployer,
        SAT,
        sat;

    const AMOUNT = '1000000000000000000000';

    beforeEach(async function () {
        [deployer, addr1, addr2, addr3, addr4, addr5, addr6, proxyDeployer] = await ethers.getSigners();


        SAT = await ethers.getContractFactory('SATERC20Token');
        const PROXY = await ethers.getContractFactory('AdminUpgradeabilityProxy');

        sat = await PROXY.connect(proxyDeployer).deploy(proxyDeployer.address, (await SAT.deploy()).address, '0x');
        sat = await SAT.attach(sat.address);
        await sat.__SATERC20Token_initialize();
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

    async function mint_before_test_lock_mint() {
        await sat.mint(addr3.address, AMOUNT);
        await sat.mint(addr4.address, AMOUNT);

        await sat.lock_mint(addr3.address, AMOUNT,BigInt((Number(await latest())+500).toString()).toString());
        await sat.lock_mint(addr4.address, AMOUNT,BigInt(Number(await latest())+500).toString().toString());

        expect(await sat.balanceOf(addr3.address)).to.equal(BigInt(2*AMOUNT));
        expect(await sat.balanceOf(addr4.address)).to.equal(BigInt(2*AMOUNT));
    }

  describe('lock_mint()', () => {

        it('should allow owner to lock_mint', async () => {
            await sat.mint(addr3.address, AMOUNT);
            await sat.mint(addr4.address, AMOUNT);
            let addr3_banlance = await sat.balanceOf(addr3.address);
            let addr4_banlance = await sat.balanceOf(addr4.address);

            await sat.lock_mint(addr3.address, AMOUNT,BigInt(500).toString());
            await sat.lock_mint(addr4.address, AMOUNT,BigInt(500).toString());

            await expect( await sat.balanceOf(addr3.address)).to.equal(BigInt(addr3_banlance)+BigInt(AMOUNT));
            await expect( await sat.balanceOf(addr4.address)).to.equal(BigInt(addr4_banlance)+BigInt(AMOUNT));

            await expect( await sat.freezedBalanceOf(addr3.address)).to.equal(BigInt(0));
            await expect( await sat.freezedBalanceOf(addr4.address)).to.equal(BigInt(0));

            await   expect( sat.connect(addr4).lock_mint(addr3.address, AMOUNT,BigInt(500).toString())).to.be.revertedWith("Ownable: caller is not the owner");

        });
      it('should not tranfer before unlock time', async () => {
          await  mint_before_test_lock_mint();
          await expect(sat.connect(addr3).transfer(addr2.address,(BigInt(AMOUNT*1.5)).toString())).to.be.reverted;

      });
      it('should  tranfer after unlock time', async () => {
          await  mint_before_test_lock_mint();
          await increase(300);
          expect(await sat.freezedBalanceOf(addr3.address)).to.equal(BigInt(AMOUNT));
          expect(await sat.freezedBalanceOf(addr4.address)).to.equal(BigInt(AMOUNT));
          await expect(sat.connect(addr3).transfer(addr2.address,(BigInt(AMOUNT*2)).toString())).to.be.reverted;
          await increase(200);
          expect(await sat.freezedBalanceOf(addr3.address)).to.equal(BigInt(0));
          expect(await sat.freezedBalanceOf(addr4.address)).to.equal(BigInt(0));
          sat.connect(addr3).transfer(addr2.address,(BigInt(AMOUNT*2)).toString());

      });

      it('should  tranfer after multi unlock time', async () => {
          await sat.mint(addr3.address, AMOUNT);
          await sat.lock_mint(addr3.address, AMOUNT,BigInt((Number(await latest())+500).toString()).toString());
          expect(await sat.balanceOf(addr3.address)).to.equal(BigInt(2*AMOUNT));
          await expect(sat.connect(addr3).transfer(addr2.address,(BigInt(AMOUNT*2)).toString())).to.be.reverted;
          await sat.lock_mint(addr3.address, AMOUNT,BigInt((Number(await latest())+200).toString()).toString());
          await expect(sat.connect(addr3).transfer(addr2.address,(BigInt(AMOUNT*2)).toString())).to.be.reverted;
          await increase(300);
          await  sat.connect(addr3).transfer(addr2.address,(BigInt(AMOUNT*2)).toString())
          expect(await sat.freezedBalanceOf(addr3.address)).to.equal(BigInt(AMOUNT));
          expect(await sat.balanceOf(addr3.address)).to.equal(BigInt(AMOUNT));
          await increase(300);
          expect(await sat.freezedBalanceOf(addr3.address)).to.equal(BigInt(0));
          expect(await sat.balanceOf(addr3.address)).to.equal(BigInt(AMOUNT));
          await  sat.connect(addr3).transfer(addr2.address,(BigInt(AMOUNT)).toString())
          expect(await sat.balanceOf(addr3.address)).to.equal(BigInt(0));
          expect(await sat.balanceOf(addr2.address)).to.equal(BigInt(3*AMOUNT));
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
