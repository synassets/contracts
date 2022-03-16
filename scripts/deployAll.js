const { ethers } = require("hardhat");

async function main() {
    const [logicOwner, proxyOwner] = await ethers.getSigners();
    console.log('logicOwner: ' + logicOwner.address);
    console.log('proxyOwner: ' + proxyOwner.address);

    const USDC_Decimal = 6;
    const SAT_Decimal = 18;

    // timestamp
    const OGOpenAt = 1647423598;
    const OGCloseAt = 1647509998;
    // timestamp

    // USDC
    const OGPriceStart = 0.15;
    const OGPriceEnd = 0.2;
    const OGMax = 1000;
    const OGMin = 500;
    const OGGoal = 100000;
    // USDC

    // %
    const OGInviterRewardRate = 0.025;
    const OGInviteeRewardRate = 0.01;
    const OGInviteepoolReward = 0.015;
    // %

    const OGMarketFund = '0x1dE27655b33603b3A6812177b9c2c480FB238fDb';
    const OGLiquidityFund = '0xfB02594433D3ab409dda8e5092cb4F68C6cbafc1';

    // timestamp
    const PBOpenAt = 1642655409;
    const PBCloseAt = 1642655409;
    // timestamp

    // USDC
    const PBPriceStart = 0.2;
    const PBPriceEnd = 0.35;
    const PBMax = 10000;
    const PBMin = 500;
    const PBGoal = 1000000;
    // USDC

    // %
    const PBInviterRewardRate = 0.04;
    const PBInviteeRewardRate = 0.01;
    // %

    const PBMarketFund = '0xf233dCA83a1122F9F15009b0de0b5a6b109cDc60';
    const PBLiquidityFund = '0x73C8FF04bDF80179a3BFfdcF9Fffc25B71306F5f';

    const SAT_LOCK_DURATION = 60*24*60*60;

    const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

    const OGParameters = formatParameters(OGPriceStart,OGPriceEnd,OGGoal,USDC_Decimal,SAT_Decimal,OGOpenAt,OGCloseAt,OGMax,OGMin,OGInviterRewardRate,OGInviteeRewardRate,OGInviteepoolReward);

    console.log('OGParameters: ' + OGParameters);

 /*
    const PBParameters = formatParameters(PBPriceStart,PBPriceEnd,PBGoal,USDC_Decimal,SAT_Decimal,PBOpenAt,PBCloseAt,PBMax,PBMin,PBInviterRewardRate,PBInviteeRewardRate);

    const SAT = await ethers.getContractFactory('SATERC20Token');
    const TOKEN_SALE = await ethers.getContractFactory('TokenSale');
    const SATTTIMELOCK = await ethers.getContractFactory('SATTimelock');
    const PROXY = await ethers.getContractFactory('AdminUpgradeabilityProxy');

    const logicSAT = await SAT.connect(proxyOwner).deploy();
    await logicSAT.deployed();

    const logicTOKEN_SALE = await TOKEN_SALE.connect(proxyOwner).deploy();
    await logicTOKEN_SALE.deployed();

    const loginSATTTIMELOCK = await SATTTIMELOCK.connect(proxyOwner).deploy();
    await loginSATTTIMELOCK.deployed();

    let proxySAT = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logicSAT.address, '0x');
    await proxySAT.deployed();
    proxySAT = await SAT.attach(proxySAT.address);
    await proxySAT.connect(logicOwner).__SATERC20Token_initialize();

    let proxyTOKEN_SALE_OG = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logicTOKEN_SALE.address, '0x');
    await proxyTOKEN_SALE_OG.deployed();
    proxyTOKEN_SALE_OG = await TOKEN_SALE.attach(proxyTOKEN_SALE_OG.address);

    await proxyTOKEN_SALE_OG.connect(logicOwner).__TokenSale_initialize(
        true,
        proxySAT.address,
        USDC,
        OGMarketFund,
        OGLiquidityFund,
        OGParameters
    );

    let proxyTOKEN_SALE_PB = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, logicTOKEN_SALE.address, '0x');
    await proxyTOKEN_SALE_PB.deployed();
    proxyTOKEN_SALE_PB = await TOKEN_SALE.attach(proxyTOKEN_SALE_PB.address);
    await proxyTOKEN_SALE_PB.connect(logicOwner).__TokenSale_initialize(
        false,
        proxySAT.address,
        USDC,
        PBMarketFund,
        PBLiquidityFund,
        PBParameters
    );

    let proxySATTIMELOCK = await PROXY.connect(proxyOwner).deploy(proxyOwner.address, loginSATTTIMELOCK.address, '0x');
    await proxySATTIMELOCK.deployed();
    proxySATTIMELOCK = await SATTTIMELOCK.attach(proxySATTIMELOCK.address);
    await proxySATTIMELOCK.connect(logicOwner).__SATTimelock_initialize(proxySAT.address, logicOwner.address, SAT_LOCK_DURATION);

    await proxySAT.connect(logicOwner).pauseTransfer();
    await proxySAT.connect(logicOwner).addWhitelist(proxySAT.address);
    await proxySAT.connect(logicOwner).setLockedAddress(proxySATTIMELOCK.address);
    await proxySAT.connect(logicOwner).setVault(proxyTOKEN_SALE_OG.address);
    // await proxySAT.connect(logicOwner).setVault(proxyTOKEN_SALE_PB.address);

    console.log('logicSAT address: ' + logicSAT.address);
    console.log('logicTOKEN_SALE address: ' + logicTOKEN_SALE.address);
    console.log('loginSATTTIMELOCK address: ' + loginSATTTIMELOCK.address);

    console.log('proxySAT address: ' + proxySAT.address);
    console.log('proxyTOKEN_SALE_OG address: ' + proxyTOKEN_SALE_OG.address);
    console.log('proxyTOKEN_SALE_PC address: ' + proxyTOKEN_SALE_PB.address);
    console.log('proxySATTIMELOCK address: ' + proxySATTIMELOCK.address);*/
}

function formatParameters(start,end,goal,decimal1,decimal2,openAt,closeAt,max,min,rate1,rate2,rate3) {
    const [k,k_Denominator,b,b_Denominator] = calcK_B(start,end,goal,decimal1,decimal2);

    openAt = BigInt(openAt);
    closeAt = BigInt(closeAt);
    goal = BigInt(goal * (10 ** decimal1));
    max = BigInt(max * (10 ** decimal1));
    min = BigInt(min * (10 ** decimal1));
    rate1 = BigInt(rate1 * (10 ** 18));
    rate2 = BigInt(rate2 * (10 ** 18));
    rate3 = BigInt(rate3 * (10 ** 18));
    return [k,k_Denominator,b,b_Denominator,openAt,closeAt,goal,max,min,rate1,rate2,rate3];
}

function calcK_B(start,end,goal,decimal1,decimal2) {
    start = BigInt(start * (10 ** decimal1));
    end = BigInt(end * (10 ** decimal1));
    goal = BigInt(goal * (10 ** decimal1));
    decimal2 = BigInt(decimal2);

    let b = start;
    let b_Denominator = 10n ** decimal2;
    while (b % 10n === 0n && b_Denominator % 10n === 0n) {
        b = b / 10n;
        b_Denominator = b_Denominator / 10n;
    }

    let k = end - start;
    let k_Denominator = goal / ((end + start) / 2n) * (10n ** decimal2) * (10n ** decimal2);
    while (k % 10n === 0n && k_Denominator % 10n === 0n) {
        k = k / 10n;
        k_Denominator = k_Denominator / 10n;
    }

    return [k,k_Denominator,b,b_Denominator];
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
