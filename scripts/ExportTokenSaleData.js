// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

let
    DAI,
    dai,
    SAT,
    sat,
    TokenSale,

    maxAmount1 = '600000000000000000000',
    maxAmount1PerWallet = '10000000000',
    minAmount1PerWallet = '10000000000000000000',
    ratioInviterReward = '50000000000000000',
    ratioInviteeReward = '0',   // for test
    initialMint = '10000000000000000000000000';

// usage: npx hardhat run scripts/ExportTokenSaleData.js > data.csv
async function main() {
    //   mocha: {
    //     timeout: 200000
    //   }

    const [deployer, addr6, addr7] = await ethers.getSigners();

    DAI = await ethers.getContractFactory('MockUSDC');
    dai = await DAI.deploy();
    await dai.__MockUSDC_initialize();

    SAT = await ethers.getContractFactory('SATERC20Token');
    sat = await SAT.deploy();
    await sat.__SATERC20Token_initialize();

    TokenSale = await ethers.getContractFactory('TokenSale');

    const numberAddress = 100;
    const maxAmount1PerWallet_ = maxAmount1PerWallet;

    const openAt = (BigInt(new Date().getTime()) / 1000n).toString();
    const closeAt = (BigInt(new Date().getTime()) / 1000n + 3600n).toString();
    const tokenSale_ = await TokenSale.deploy();
    await tokenSale_.__TokenSale_initialize(
        false,
        sat.address,                                        // token0_
        dai.address,                                        // token1_
        addr6.address,
        addr7.address,
        // 0.05  1000000 USDC  sat decimal        usdc decimal
        //"100  000000000000  000000000000000000  000000"
        ["5","100000000","150000","1",openAt,closeAt,(BigInt(maxAmount1PerWallet) * BigInt(numberAddress)).toString(),maxAmount1PerWallet,maxAmount1PerWallet,"40000000000000000","10000000000000000"]
    );

    await sat.setVault(tokenSale_.address);
    const inviter = ethers.Wallet.createRandom();
    await tokenSale_.addInviteable([inviter.address]);
    console.log('In,Out');
    for (let index = 0; index < numberAddress; index ++) {
        const addr = ethers.Wallet.createRandom().connect(ethers.provider);

        await deployer.sendTransaction({
            to: addr.address,
            value: ethers.utils.parseEther("1")
        });
        await dai.connect(addr).mint();
        await dai.connect(addr).approve(tokenSale_.address, maxAmount1PerWallet_);
        await tokenSale_.connect(addr).swap(maxAmount1PerWallet_, inviter.address);

        console.log(
            (index + 1) + ',' +
            maxAmount1PerWallet_ + ',' +
            ethers.utils.formatEther(await sat.balanceOf(addr.address))
        );
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
