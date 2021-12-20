const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { expect } = require("chai");
const { advanceBlockTo, latestBlock } = require("./utils");

// @ts-ignore

// type Contract = any
describe('ConsensusPool', () => {
    let
        // Used as default deployer for contracts, asks as owner of contracts.
        deployer,
        addr1,
        addr2,
        addr3,
        DAI,
        dai,
        SYNASSETS,
        synassets,
        Treasury,
        treasury,
        Staking,
        staking,
        sSYNASSETS,
        ssynassets,
        StakingWarmup,
        stakingWarmup,
        Distributor,
        distributor,
        ConsensusPool,
        consensusPool,
        epochLength = '120',
        firstEpochNumber = '1',
        firstEpochBlock = '200',
        stakingRewardRate = '4046',
        consensusRewardRate = '1000',
        zeroAddress = '0x0000000000000000000000000000000000000000',
        initialMint = '10000000000000000000000000';

    let
        synassetsTotalSupply;

    beforeEach(async function () {
        [deployer, addr1, addr2, addr3] = await ethers.getSigners();

        DAI = await ethers.getContractFactory('DAI');
        dai = await DAI.deploy( 0 );

        SYNASSETS = await ethers.getContractFactory('MockSynassetsERC20Token');
        synassets = await SYNASSETS.deploy();

        Treasury = await ethers.getContractFactory('MockSynassetsTreasury');
        treasury = await Treasury.deploy(synassets.address, dai.address, 0);

        sSYNASSETS = await ethers.getContractFactory('sSynassets');
        ssynassets = await sSYNASSETS.deploy();

        Staking = await ethers.getContractFactory('MockSynassetsStaking');
        staking = await Staking.deploy(synassets.address, ssynassets.address, epochLength, firstEpochNumber, firstEpochBlock);

        Distributor = await ethers.getContractFactory('Distributor');
        distributor = await Distributor.deploy(treasury.address, synassets.address, epochLength, firstEpochBlock);

        StakingWarmup = await ethers.getContractFactory('StakingWarmup');
        stakingWarmup = await StakingWarmup.deploy(staking.address, ssynassets.address);

        ConsensusPool = await ethers.getContractFactory('ConsensusPool');
        consensusPool = await ConsensusPool.deploy();
        await consensusPool.initialize(synassets.address, ssynassets.address, epochLength, firstEpochNumber, firstEpochBlock, staking.address, distributor.address);

        await synassets.setVault(treasury.address);
        await dai.mint(deployer.address, initialMint);

        await staking.setContract('0', distributor.address);
        await staking.setContract('1', stakingWarmup.address);
        await staking.setContract('3', consensusPool.address);

        await ssynassets.initialize(staking.address);

        await distributor.addRecipient(staking.address, stakingRewardRate);
        await distributor.addRecipient(consensusPool.address, consensusRewardRate);

        await treasury.queue('8', distributor.address);
        await treasury.toggle('8', distributor.address, zeroAddress);

        await treasury.queue('0', deployer.address);
        await treasury.toggle('0', deployer.address, zeroAddress);

        const value = await treasury.valueOfToken(dai.address, initialMint);
        synassetsTotalSupply = BigInt(value / 2);
        await dai.approve(treasury.address, initialMint);
        await treasury.deposit(initialMint, dai.address, synassetsTotalSupply.toString());

        expect(await synassets.balanceOf(deployer.address)).to.equal(synassetsTotalSupply);
    });

    describe('initialize()', () => {
        it('should initialize twice', function () {
            expect(consensusPool.initialize(synassets.address, ssynassets.address, epochLength, firstEpochNumber, firstEpochBlock, staking.address, distributor.address)).to.be.revertedWith('AI');
        });
    });

    // console.log((await latestBlock()).toString());
    // await advanceBlockTo(200);
    // console.log((await latestBlock()).toString());
    describe('stake()', () => {
        it('should NOT allow users to stake or unstake', async () => {
            // console.log('A t: ' + treasury.address);
            expect(consensusPool.stake(deployer.address, zeroAddress, synassetsTotalSupply.toString())).to.be.revertedWith('OSC');
            expect(consensusPool.unstake(deployer.address, synassetsTotalSupply.toString())).to.be.revertedWith('OSC');
        });

        it('should stake with zero address', async () => {
            // console.log('B t: ' + treasury.address);
            const _amount = synassetsTotalSupply / BigInt(10);
            await synassets.approve(staking.address, _amount.toString());
            await staking.stake(_amount.toString(), deployer.address);
            expect(staking.claimToken(deployer.address, zeroAddress)).to.be.revertedWith('IA');
        });

        it('should stake with normal address', async () => {
            const _amount = synassetsTotalSupply / BigInt(10);
            await synassets.approve(staking.address, _amount.toString());
            await staking.stake(_amount.toString(), deployer.address);
            await staking.claimToken(deployer.address, addr1.address);

            expect(await synassets.balanceOf(deployer.address)).to.equal(synassetsTotalSupply - _amount);

            const userInfo = await consensusPool.userInfos(addr1.address);
            expect(userInfo.power).to.equal(_amount);
        });

        it('should multiple stake', async () => {
            let _deployerBalance = synassetsTotalSupply;
            const _tenPercent = _deployerBalance / BigInt(10);
            await synassets.approve(staking.address, synassetsTotalSupply.toString());

            _deployerBalance = _deployerBalance - _tenPercent;

            let addr1CurrentPower = _tenPercent;
            await staking.stake(_tenPercent.toString(), deployer.address);
            await staking.claimToken(deployer.address, addr1.address);

            await synassets.transfer(addr2.address, _deployerBalance - _tenPercent);

            let addr3CurrentPower = 0n;
            await synassets.connect(addr2).approve(staking.address, synassetsTotalSupply.toString());

            for (let index = 0; index < 8; index ++) {
                await advanceBlockTo(firstEpochBlock);
                firstEpochBlock = (BigInt(firstEpochBlock) + BigInt(epochLength)).toString();

                await staking.connect(addr2).stake(_tenPercent.toString(), addr2.address);
                await staking.connect(addr2).claimToken(addr2.address, addr3.address);
                if (index < 4) addr3CurrentPower = addr3CurrentPower * (10000n - 797n) / 10000n;
                addr3CurrentPower += _tenPercent;

                await consensusPool.connect(addr1).claimReward();
                addr1CurrentPower = addr1CurrentPower * (10000n - 797n) / 10000n;
            }

            const userInfo1 = await consensusPool.userInfos(addr1.address);
            const userInfo3 = await consensusPool.userInfos(addr3.address);

            expect(userInfo1.power).to.equal(addr1CurrentPower);
            expect(userInfo3.power).to.equal(addr3CurrentPower.toString());

            await staking.stake('0', deployer.address);
            await staking.claimToken(deployer.address, addr1.address);

            const inviteeInfo = await consensusPool.inviteeInfos(addr1.address, deployer.address);
            expect((BigInt(inviteeInfo.power) / 100n).toString()).to.equal((addr1CurrentPower / 100n).toString());
        });
    });

    describe('unstake()', () => {
        let
            initStakeAmount;

        beforeEach(async () => {
            initStakeAmount = synassetsTotalSupply / BigInt(10);
            await synassets.approve(staking.address, initStakeAmount.toString());
            await staking.stake(initStakeAmount.toString(), deployer.address);
            await staking.claimToken(deployer.address, addr1.address);

            expect(await synassets.balanceOf(deployer.address)).to.equal(synassetsTotalSupply - initStakeAmount);

            const userInfo = await consensusPool.userInfos(addr1.address);
            expect(userInfo.power).to.equal(initStakeAmount);
        });

        it('should unstake exceed stake amount', async () => {
            const _amount = initStakeAmount + BigInt(1);
            await ssynassets.approve(staking.address, _amount.toString());
            expect(staking.unstake(_amount.toString(), false)).to.be.revertedWith('SafeMath: subtraction overflow');
        });

        it('should unstake', async () => {
            await ssynassets.approve(staking.address, initStakeAmount.toString());
            await staking.unstake(initStakeAmount.toString(), false);

            expect(await synassets.balanceOf(deployer.address)).to.equal(synassetsTotalSupply);

            const userInfo = await consensusPool.userInfos(addr1.address);
            expect(userInfo.power).to.equal(BigInt(0));

            const info = await consensusPool.getInfo(addr1.address);
            expect(info.claimableAmount).to.equal(BigInt(0));
        });
    });

    describe('claimReward()', () => {

        it('should claim by anyone', async () => {
            await consensusPool.connect(addr2).claimReward();
            expect(await synassets.balanceOf(addr2.address)).to.equal('0');
        });

        it('should claim', async () => {
            let totalReward = BigInt(0);
            let deployerBalance = synassetsTotalSupply;

            await synassets.approve(staking.address, synassetsTotalSupply.toString());
            const _tenPercent = deployerBalance / BigInt(10);
            for (let index = 0; index < 10; index ++) {
                await advanceBlockTo(firstEpochBlock);
                firstEpochBlock = (BigInt(firstEpochBlock) + BigInt(epochLength)).toString();

                deployerBalance = deployerBalance - _tenPercent;
                await staking.stake(_tenPercent.toString(), deployer.address);
                await staking.claimToken(deployer.address, addr1.address);
                const incrementAmount1 = synassetsTotalSupply * BigInt(stakingRewardRate) / 1000000n;
                synassetsTotalSupply += incrementAmount1;
                const incrementAmount2 = synassetsTotalSupply * BigInt(consensusRewardRate) / 1000000n;
                synassetsTotalSupply += incrementAmount2;

                expect(await synassets.totalSupply()).to.equal(synassetsTotalSupply);
                expect(await synassets.balanceOf(deployer.address)).to.equal(deployerBalance);

                await consensusPool.connect(addr1).claimReward();
                expect((BigInt(await synassets.balanceOf(addr1.address)) / 100n).toString()).to.equal((totalReward / 100n).toString());

                totalReward += incrementAmount2;
            }
        });
    });

    describe('power decay', () => {
        let
            initStakeAmount;

        beforeEach(async () => {
            initStakeAmount = synassetsTotalSupply / BigInt(10);
            await synassets.approve(staking.address, initStakeAmount.toString());
            await staking.stake(initStakeAmount.toString(), deployer.address);
            await staking.claimToken(deployer.address, addr1.address);

            expect(await synassets.balanceOf(deployer.address)).to.equal(synassetsTotalSupply - initStakeAmount);

            const userInfo = await consensusPool.userInfos(addr1.address);
            expect(userInfo.power).to.equal(initStakeAmount);
        });

        it('should burn', async () => {
            let rewardTotal = 0n;
            let rewardClaimable = 0n;
            let rewardClaim = 0n;
            await synassets.approve(staking.address, synassetsTotalSupply.toString());
            for (let index = 0; index < 20; index ++) {
                await advanceBlockTo(firstEpochBlock);
                firstEpochBlock = (BigInt(firstEpochBlock) + BigInt(epochLength)).toString();

                await staking.stake('0', addr2.address);
                await staking.claimToken(addr2.address, addr3.address);

                synassetsTotalSupply += synassetsTotalSupply * BigInt(stakingRewardRate) / 1000000n;
                const rewardSingle = synassetsTotalSupply * BigInt(consensusRewardRate) / 1000000n;
                if (index < 2) {
                    rewardClaimable += rewardSingle;
                    rewardClaim += rewardSingle * ((10000n - 797n) ** BigInt(index + 1)) / (10000n ** BigInt(index + 1));
                }
                rewardTotal += rewardSingle;
                synassetsTotalSupply += rewardSingle;
            }

            await consensusPool.connect(addr1).claimReward();

            const epoch = await consensusPool.epoch();
            const userInfo = await consensusPool.userInfos(addr1.address);

            expect(userInfo.claimCounter).to.equal(3);
            expect(userInfo.rewardCounter).to.equal(0);
            expect(await synassets.balanceOf(addr1.address)).to.equal(rewardClaim);
            expect(userInfo.totalBurnAmount).to.equal(rewardTotal - rewardClaimable - BigInt(epoch.distribute));
        });

        it('should decay', async () => {
            let currentPower = initStakeAmount;
            await synassets.approve(staking.address, synassetsTotalSupply.toString());
            for (let index = 0; index < 21; index ++) {
                await advanceBlockTo(firstEpochBlock);
                firstEpochBlock = (BigInt(firstEpochBlock) + BigInt(epochLength)).toString();

                await staking.stake('1000000000', addr2.address);
                await staking.claimToken(addr2.address, addr3.address);

                await consensusPool.connect(addr1).claimReward();

                currentPower = currentPower * (10000n - 797n) / 10000n;
            }

            const sSYNASSETSBalance = BigInt(await ssynassets.balanceOf(deployer.address));
            await ssynassets.approve(staking.address, sSYNASSETSBalance.toString());
            await staking.unstake((BigInt(0)).toString(), false);
            const inviteeInfo = await consensusPool.inviteeInfos(addr1.address, deployer.address);
            const userInfo = await consensusPool.userInfos(addr1.address);

            expect(userInfo.power).to.equal(currentPower);

            let diff = BigInt(userInfo.power) - BigInt(inviteeInfo.power);
            diff = diff > 0 ? diff : -diff;
            expect(Number(diff.toString())).to.lessThan(Number((BigInt(userInfo.power) / 100n).toString()));

            await staking.unstake((sSYNASSETSBalance / BigInt(2)).toString(), false);
            const inviteeInfo1 = await consensusPool.inviteeInfos(addr1.address, deployer.address);
            const userInfo1 = await consensusPool.userInfos(addr1.address);

            let diff1 = BigInt(userInfo1.power) - BigInt(inviteeInfo1.power);
            diff1 = diff1 > 0 ? diff1 : -diff1;
            expect(Number(diff1.toString())).to.lessThan(Number((BigInt(userInfo1.power) / 100n).toString()));

            const sSYNASSETSBalance1 = BigInt(await ssynassets.balanceOf(deployer.address));
            await staking.unstake(sSYNASSETSBalance1.toString(), false);
            const inviteeInfo2 = await consensusPool.inviteeInfos(addr1.address, deployer.address);
            const userInfo2 = await consensusPool.userInfos(addr1.address);

            expect(inviteeInfo2.power).to.equal(0n);
            expect(Number(userInfo2.power)).to.lessThan(5000000000);
        });
    });
});
