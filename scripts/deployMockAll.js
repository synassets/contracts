const { ethers } = require("hardhat");

async function main() {
    const [logicOwner, proxyOwner] = await ethers.getSigners();
    console.log('logicOwner: ' + logicOwner.address);
    console.log('proxyOwner: ' + proxyOwner.address);

    const SAT = await ethers.getContractFactory('MockSATERC20Token');
    const USDC = await ethers.getContractFactory('MockUSDC');
    const TOKEN_SALE = await ethers.getContractFactory('MockTokenSale');
    const SATTTIMELOCK = await ethers.getContractFactory('SATTimelock');
    const PROXY = await ethers.getContractFactory('AdminUpgradeabilityProxy');

    const logicSAT = await SAT.connect(proxyOwner).deploy();
    const logicUSDC = await USDC.connect(proxyOwner).deploy();
    const logicTOKEN_SALE = await TOKEN_SALE.connect(proxyOwner).deploy();
    const loginSATTTIMELOCK = await SATTTIMELOCK.connect(proxyOwner).deploy();

    await logicSAT.deployed();
    await logicUSDC.deployed();
    await logicTOKEN_SALE.deployed();
    await loginSATTTIMELOCK.deployed();

    let proxySAT = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logicSAT.address, '0x');
    await proxySAT.deployed();
    proxySAT = await SAT.attach(proxySAT.address);
    await proxySAT.connect(logicOwner).__SATERC20Token_initialize();

    let proxyUSDC = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logicUSDC.address, '0x');
    await proxyUSDC.deployed();
    proxyUSDC = await USDC.attach(proxyUSDC.address);
    await proxyUSDC.connect(logicOwner).__MockUSDC_initialize();

    const openAt = (BigInt(new Date().getTime()) / 1000n).toString();
    const closeAt = (BigInt(new Date().getTime()) / 1000n + 3600n * 24n * 2n).toString();

    let proxyTOKEN_SALE_OG = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logicTOKEN_SALE.address, '0x');
    await proxyTOKEN_SALE_OG.deployed();
    proxyTOKEN_SALE_OG = await TOKEN_SALE.attach(proxyTOKEN_SALE_OG.address);
    // total= all the SAT prepare  to sell * 10^18
    // b = start_price    = usdc_price * 10^6 / 10 ^18
    // end_price = usdc_price * 10^6 / 10 ^18
    // k = （end_price-start_price）/  total
    await proxyTOKEN_SALE_OG.connect(logicOwner).__TokenSale_initialize(
        true,
        proxySAT.address,
        proxyUSDC.address,
        '0x1dE27655b33603b3A6812177b9c2c480FB238fDb',
        '0xfB02594433D3ab409dda8e5092cb4F68C6cbafc1',
        '0x9975F9a2fa18B1a2afCbB590aD25E17c294aD3D9',   // inviterRewardPoolAddress
        ["5","571428500000000000000000000000000000000","15","100000000000000",openAt,closeAt,"1000000000000","1000000000","1000000000","25000000000000000","15000000000000000"]
    );

    let proxyTOKEN_SALE_PC = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logicTOKEN_SALE.address, '0x');
    await proxyTOKEN_SALE_PC.deployed();
    proxyTOKEN_SALE_PC = await TOKEN_SALE.attach(proxyTOKEN_SALE_PC.address);
    await proxyTOKEN_SALE_PC.connect(logicOwner).__TokenSale_initialize(
        false,
        proxySAT.address,
        proxyUSDC.address,
        '0xf233dCA83a1122F9F15009b0de0b5a6b109cDc60',
        '0x73C8FF04bDF80179a3BFfdcF9Fffc25B71306F5f',
        '0x0dBd93Ce3451b167989d4157ba433122eB482c6e',   // inviterRewardPoolAddress
        ["15","363636300000000000000000000000000000000","20","100000000000000",openAt,closeAt,"1000000000000","10000000000","500000000","25000000000000000","15000000000000000"]
    );

    let proxySATTIMELOCK = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, loginSATTTIMELOCK.address, '0x');
    await proxySATTIMELOCK.deployed();
    proxySATTIMELOCK = await SATTTIMELOCK.attach(proxySATTIMELOCK.address);
    await proxySATTIMELOCK.connect(logicOwner).__SATTimelock_initialize(proxySAT.address, logicOwner.address, 60*24*60*60);

    await proxySAT.connect(logicOwner).setVault(proxyTOKEN_SALE_OG.address);
    await proxySAT.connect(logicOwner).setVault(proxyTOKEN_SALE_PC.address);
    await proxySAT.connect(logicOwner).setLockedAddress(proxySATTIMELOCK.address);

    console.log('logicSAT address: ' + logicSAT.address);
    console.log('logicUSDC address: ' + logicUSDC.address);
    console.log('logicTOKEN_SALE address: ' + logicTOKEN_SALE.address);
    console.log('loginSATTTIMELOCK address: ' + loginSATTTIMELOCK.address);

    console.log('proxySAT address: ' + proxySAT.address);
    console.log('proxyUSDC address: ' + proxyUSDC.address);
    console.log('proxyTOKEN_SALE_OG address: ' + proxyTOKEN_SALE_OG.address);
    console.log('proxyTOKEN_SALE_PC address: ' + proxyTOKEN_SALE_PC.address);
    console.log('proxySATTIMELOCK address: ' + proxySATTIMELOCK.address);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
