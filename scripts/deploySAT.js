const { ethers } = require("hardhat");

async function main() {
    const [logicOwner, proxyOwner] = await ethers.getSigners();
    console.log('logicOwner: ' + logicOwner.address);
    console.log('proxyOwner: ' + proxyOwner.address);

    const SAT = await ethers.getContractFactory('SATERC20Token');
    const SATTIMELOCK = await ethers.getContractFactory('SATTimelock');
    const PROXY = await ethers.getContractFactory('AdminUpgradeabilityProxy');

    const logicSAT = await SAT.connect(proxyOwner).deploy();
    await logicSAT.deployed();
    let proxySAT = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logicSAT.address, '0x');
    await proxySAT.deployed();
    proxySAT = await SAT.attach(proxySAT.address);
    await proxySAT.connect(logicOwner).__SATERC20Token_initialize();

    const logicSATTIMELOCK = await SATTIMELOCK.connect(proxyOwner).deploy();
    await logicSATTIMELOCK.deployed();

    let proxySATTIMELOCK = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logicSATTIMELOCK.address, '0x');
    await proxySATTIMELOCK.deployed();
    proxySATTIMELOCK = await SATTIMELOCK.attach(proxySATTIMELOCK.address);
    await proxySATTIMELOCK.connect(logicOwner).__SATTimelock_initialize(proxySAT.address, logicOwner.address, 60*24*60*60);

    console.log('logicSAT address: ' + logicSAT.address);
    console.log('logicSATTIMELOCK address: ' + logicSATTIMELOCK.address);

    console.log('proxySAT address: ' + proxySAT.address);
    console.log('proxySATTIMELOCK address: ' + proxySATTIMELOCK.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
