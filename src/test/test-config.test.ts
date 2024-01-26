export let testConfig = {
  // Set env ETHEREUM_RPC to change default fork RPC.
  ethereumForkRPC: process.env.ETHEREUM_RPC ?? 'https://cloudflare-eth.com',

  showVerboseLogs: false,

  // Mock wallets for tests
  signerMnemonic: 'test test test test test test test test test test test junk',
  railgunMnemonic:
    'test test test test test test test test test test test junk',
  railgunMnemonic2:
    'nation page hawk lawn rescue slim cup tired clutch brand holiday genuine',
  encryptionKey:
    '0101010101010101010101010101010101010101010101010101010101010101',

  contractsEthereum: {
    // ORIGINAL
    // proxy: '0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9',
    // treasuryProxy: '0xE8A8B458BcD1Ececc6b6b58F80929b29cCecFF40',
    // weth9: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    // relayAdapt: '0x0355B7B8cb128fA5692729Ab3AAa199C1753f726',

    // FOR AAVE
    proxy: '0x3D38797032bf802Bb5A0594Aae994c3d7Bf46799',
    treasuryProxy: '0xfe204b14e796ddcB1DB084B72bdfb8a80a95699d',
    weth9: '0x6FECC8053e14A5591D7494A2Fa8F4f5E5f016BFb',
    relayAdapt: '0x3aB4dA0f8fa0E0Bb3db60ceE269c90Ea296b9a5b',
    wbtc: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    
    // FOR DAI MINTING 
    // proxy: '0x282Bd9c75B1fB7D17A587de34D65ba37919Be348',
    // treasuryProxy: '0x9c6b1EAC0805AD04f409cd60faFe61c1031EE23d',
    // weth9: '0xaCd12F0a22FB91CbD0a7b9F91c8EC969Dfd289dC',
    // relayAdapt: '0xE78A181cC5F8bB7bDb2D9bc4466C74776A4638D5',
    // wbtc: "0x7ccf0411c7932b99fc3704d68575250f032e3bb7",

    // WARNING: Be careful adding tokens to this list.
    // Each new token will increase the setup time for tests.
    // Standard tokens
    rail: '0xe76C6c83af64e4C60245D8C7dE953DF673a7A33D',
    usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    // LP tokens
    usdcWethSushiSwapV2LPToken: '0x397ff1542f962076d0bfe58ea045ffa2d347aca0',
    // Vault tokens
    crvUSDCWBTCWETH: '0x7F86Bf177Dd4F3494b841a37e810A34dD56c829B',
    mooConvexTriCryptoUSDC: '0xD1BeaD7CadcCC6b6a715A6272c39F1EC54F6EC99',
  },

  contractsArbitrum: {
    proxy: '0xfa7093cdd9ee6932b4eb2c9e1cde7ce00b1fa4b9',
    treasuryProxy: '0xE8A8B458BcD1Ececc6b6b58F80929b29cCecFF40',
    weth9: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    relayAdapt: '0x0355B7B8cb128fA5692729Ab3AAa199C1753f726',

    // Standard tokens
    dai: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
  },

  // OVERRIDES - override using test-config-overrides.ts

  // API Domain for a proxy server equipped with 0x nginx config that includes private API key.
  zeroXProxyApiDomain: process.env.ZERO_X_PROXY_API_DOMAIN ?? '',
  // API Key for 0x API.
  zeroXApiKey: process.env.ZERO_X_API_KEY ?? '',
};

try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, global-require, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
  const overrides = require('./test-config-overrides.test').default;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  testConfig = { ...testConfig, ...overrides };
  // eslint-disable-next-line no-empty
} catch {
  // eslint-disable-next-line no-console
  console.error('Could not load test-config-overrides.');
}
