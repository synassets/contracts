const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { expect } = require("chai");
const { advanceBlockTo, latestBlock, advanceBlock, duration, increase, approximately } = require("./utils");

describe('SATTimelock', () => {
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
        sat,
        SATTimelock,
        satTimelock;

    const
        DURATION = duration.days(60),
        AMOUNT = '1000000000000000000000',
        RATIO_FEE = 10n;

    beforeEach(async function () {
        [deployer, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

        SAT = await ethers.getContractFactory('SATERC20Token');
        sat = await SAT.deploy();
        await sat.setVault(deployer.address);

        SATTimelock = await ethers.getContractFactory('SATTimelock');
        satTimelock = await SATTimelock.deploy(sat.address, addr6.address, DURATION.toString());

        await sat.setFeeAddress(satTimelock.address);
    });

    describe('SATTimelock', () => {
        it('should increaseBenefit', async () => {
            for (let index = 0; index < 20; index ++) {
                await sat.mint(addr1.address, AMOUNT);

                expect(await sat.balanceOf(addr1.address)).to.equal(BigInt(index + 1) * BigInt(AMOUNT));
                expect(approximately(BigInt(await satTimelock.benefit()) + BigInt(await satTimelock.benefitUnlocked()), BigInt(index + 1) * BigInt(AMOUNT) / RATIO_FEE, 100000n)).to.equal(true);
                expect(await sat.balanceOf(satTimelock.address)).to.equal(BigInt(index + 1) * BigInt(AMOUNT) / RATIO_FEE);
            }
        });

        it('should claimBenefit', async () => {
            await sat.mint(addr1.address, AMOUNT);
            await sat.mint(addr1.address, AMOUNT);

            await increase(DURATION / 2);

            await satTimelock.connect(addr6).claimBenefit();
            expect(approximately(await sat.balanceOf(addr6.address), BigInt(AMOUNT) / RATIO_FEE, 100000n)).to.equal(true);

            await increase(DURATION / 2);
            await satTimelock.connect(addr6).claimBenefit();
            expect(approximately(await sat.balanceOf(addr6.address), BigInt(AMOUNT) / RATIO_FEE * 2n, 100000n)).to.equal(true);

            await increase(DURATION);
            await expect(satTimelock.connect(addr6).claimBenefit()).to.be.revertedWith('C0');
        });
    });
});
