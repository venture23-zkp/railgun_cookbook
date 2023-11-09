import ABI_ERC20 from './token/erc20.json';
import ABI_ERC721 from './token/erc721.json';
import ABI_RELAY_ADAPT from './adapt/RelayAdapt.json';
import ABI_UNI_V2_LIKE_FACTORY from './liquidity/UniV2LikeFactory.json';
import ABI_UNI_V2_LIKE_ROUTER from './liquidity/UniV2LikeRouter.json';
import ABI_UNI_V2_LIKE_PAIR from './liquidity/UniV2LikePair.json';
import ABI_BEEFY_VAULT_MERGED_V6V7 from './vault/beefy/BeefyVault-MergedV6V7.json';
import ABI_AAVE_POOL from './aave/AavePool.json';
import ABI_ERC6551_REGISTRY from './registry/ERC6551Registry.json';
import ABI_ACCESS_CARD_ERC721 from './access-card/AccessCardERC721.json';
import ABI_ACCESS_CARD_OWNER_ACCOUNT from './access-card/AccessCardOwnerAccount.json';
import ABI_CDP_MANAGER from './dai-minting/CdpManager.json';
import ABI_TOKEN_ADAPTER from './dai-minting/TokenAdapter.json';
import ABI_MCD_VAT from './dai-minting/McdVat.json';

export const abi = {
  token: {
    erc20: ABI_ERC20,
    erc721: ABI_ERC721,
    accessCardERC721: ABI_ACCESS_CARD_ERC721,
  },
  accessCard: {
    erc721: ABI_ACCESS_CARD_ERC721,
    ownerAccount: ABI_ACCESS_CARD_OWNER_ACCOUNT,
  },
  adapt: {
    relay: ABI_RELAY_ADAPT,
  },
  liquidity: {
    uniV2LikeFactory: ABI_UNI_V2_LIKE_FACTORY,
    uniV2LikeRouter: ABI_UNI_V2_LIKE_ROUTER,
    uniV2LikePair: ABI_UNI_V2_LIKE_PAIR,
  },
  vault: {
    beefy: ABI_BEEFY_VAULT_MERGED_V6V7,
  },
  aave: {
    aavePool: ABI_AAVE_POOL,
  },
  registry: {
    erc6551Registry: ABI_ERC6551_REGISTRY,
  },
  daiMinting: {
    cdpManager: ABI_CDP_MANAGER,
    tokenAdapter: ABI_TOKEN_ADAPTER,
    mcdVat: ABI_MCD_VAT,
  }
} as const;
