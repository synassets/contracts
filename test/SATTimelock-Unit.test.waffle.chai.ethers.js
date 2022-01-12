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
        proxyDeployer,
        SAT,
        sat,
        SATTimelock,
        satTimelock;

    const
        DURATION = duration.days(60),
        AMOUNT = '1000000000000000000000',
        RATIO_FEE = 10n;

    beforeEach(async function () {
        [deployer, addr1, addr2, addr3, addr4, addr5, addr6, proxyDeployer] = await ethers.getSigners();

        SAT = await ethers.getContractFactory('SATERC20Token');
        const PROXY = await ethers.getContractFactory('AdminUpgradeabilityProxy');

        sat = await PROXY.connect(proxyDeployer).deploy(proxyDeployer.address, (await SAT.deploy()).address, '0x');
        sat = await SAT.attach(sat.address);
        await sat.__SATERC20Token_initialize();
        await sat.setVault(deployer.address);

        SATTimelock = await ethers.getContractFactory('SATTimelock');
        satTimelock = await PROXY.connect(proxyDeployer).deploy(proxyDeployer.address, (await SATTimelock.deploy()).address, '0x');
        satTimelock = await SATTimelock.attach(satTimelock.address);
        await satTimelock.__SATTimelock_initialize(sat.address, addr6.address, DURATION.toString());

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
            const feePerMint = BigInt(AMOUNT) / RATIO_FEE;
            await sat.mint(addr1.address, AMOUNT);
            await sat.mint(addr1.address, AMOUNT);

            await increase(DURATION / 2);

            await satTimelock.connect(addr6).claimBenefit();
            expect(approximately(await sat.balanceOf(addr6.address), feePerMint, 100000n)).to.equal(true);

            await increase(DURATION / 2);
            await satTimelock.connect(addr6).claimBenefit();
            expect(approximately(await sat.balanceOf(addr6.address), feePerMint * 2n, 100000n)).to.equal(true);

            await increase(DURATION);
            await expect(satTimelock.connect(addr6).claimBenefit()).to.be.revertedWith('C0');

            await sat.mint(addr1.address, AMOUNT);
            await increase(DURATION / 2);

            await satTimelock.connect(addr6).claimBenefit();
            expect(approximately(await sat.balanceOf(addr6.address), feePerMint * 2n + feePerMint / 2n, 100000n)).to.equal(true);

            await increase(DURATION / 2);

            await satTimelock.connect(addr6).claimBenefit();
            expect(approximately(await sat.balanceOf(addr6.address), feePerMint * 3n, 100000n)).to.equal(true);
        });
    });
});
