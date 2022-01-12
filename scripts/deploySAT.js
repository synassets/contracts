const { ethers } = require("hardhat");

async function main() {
    const [logicOwner, proxyOwner] = await ethers.getSigners();
    console.log('logicOwner: ' + logicOwner.address);
    console.log('proxyOwner: ' + proxyOwner.address);

    const SAT = await ethers.getContractFactory('SATERC20Token');
    const PROXY = await ethers.getContractFactory('AdminUpgradeabilityProxy');

    const logic = await SAT.connect(proxyOwner).deploy();
    const proxy = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logic.address, '0x');
    await proxy.connect(logicOwner).__SATERC20Token_initialize();

    console.log('logic address: ' + logic.address);
    console.log('proxy address: ' + proxy.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })