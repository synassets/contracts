const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { expect } = require("chai");
const { advanceBlockTo, latestBlock, advanceBlock } = require("./utils");

describe('TokenSale', () => {
    let
        // Used as default deployer for contracts, asks as owner of contracts.
        deployer,
        addr1,
        addr2,
        addr3,
        addr4,
        addr5,
        addr6,
        addr7,
        addr8,
        DAI,
        dai,
        SAT,
        sat,
        TokenSale,
        tokenSale,

        maxAmount1 = '600000000000000000000',
        maxAmount1PerWallet = '100000000000000000000',
        minAmount1PerWallet = '10000000000000000000';
        ratioInviterReward = '40000000000000000',
        ratioInviteeReward = '10000000000000000',
        initialMint = '10000000000000000000000000';

    beforeEach(async function () {
        [deployer, addr1, addr2, addr3, addr4, addr5, addr6, addr7, addr8] = await ethers.getSigners();

        DAI = await ethers.getContractFactory('DAI');
        dai = await DAI.deploy( 0 );

        SAT = await ethers.getContractFactory('SATERC20Token');
        sat = await SAT.deploy();

        const openAt = (BigInt(new Date().getTime()) / 1000n).toString();
        const closeAt = (BigInt(new Date().getTime()) / 1000n + 3600n).toString();
        TokenSale = await ethers.getContractFactory('TokenSale');
        tokenSale = await TokenSale.deploy(
            '1',                                          // k_
            '10000000000000000000000000',                       // kDenominator_
            '2000000000000000000',                              // b_
            '1000000000000000000',                              // bDenominator_
            sat.address,                                        // token0_
            dai.address,                                        // token1_
            openAt,                                             // openAt_
            closeAt,                                            // closeAt_
            true,                                               // enableWhiteList_
            maxAmount1,                                         // maxAmount1_
            maxAmount1PerWallet,                                // maxAmount1PerWallet_
            minAmount1PerWallet,                                // minAmount1PerWallet_
            addr7.address,                                      // beneficiary_
            ratioInviterReward,                                 // ratioInviterReward_
            ratioInviteeReward                                  // ratioInviteeReward_
        );

        await sat.setVault(tokenSale.address);
        await dai.mint(deployer.address, initialMint);
        await tokenSale.addWhitelist([deployer.address, addr1.address, addr2.address, addr3.address, addr4.address, addr5.address, addr6.address, addr7.address]);
    });

    describe('swap()', () => {
        it('should allow swap by someone who not on whitelist', async () => {
            await expect(tokenSale.connect(addr8).swap(maxAmount1PerWallet, deployer.address)).to.be.revertedWith('sender not on whitelist');
        });

        it('should allow swap by someone who dont has valid inviter', async () => {
            await expect(tokenSale.swap(maxAmount1PerWallet, addr8.address)).to.be.revertedWith('invalid inviter');
        });

        it('should swap', async () => {
            const swappers = [addr1, addr2, addr3, addr4, addr5, addr6];
            for (let index = 0; index < swappers.length; index ++) {
                const amount0 = BigInt(await tokenSale.calcT1(maxAmount1PerWallet));

                const swapper = swappers[index];
                await dai.transfer(swapper.address, maxAmount1PerWallet);
                await dai.connect(swapper).approve(tokenSale.address, maxAmount1PerWallet);
                await tokenSale.connect(swapper).swap(maxAmount1PerWallet, addr7.address);

                expect(await sat.balanceOf(swapper.address)).to.be.equal(amount0 + amount0 / 100n);
                expect(await sat.balanceOf(addr7.address)).to.be.equal(await tokenSale.amountInviterReward0(addr7.address));
            }

            expect(await tokenSale.amountTotal1()).to.be.equal(maxAmount1);
            expect(await dai.balanceOf(addr7.address)).to.be.equal(maxAmount1);
        });
    });
});
