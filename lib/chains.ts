// Chain configuration for balance fetching

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
}

// Chain configurations for token balance fetching
export const CHAINS: Record<number, ChainConfig> = {
  // ZetaChain Testnet
  7001: {
    id: 7001,
    name: "ZetaChain Testnet",
    rpcUrl: "https://zetachain-testnet.rpc.thirdweb.com",
    explorerUrl: "https://zetachain-testnet.explorer.thirdweb.com",
  },
  // Base Sepolia Testnet
  84532: {
    id: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia-explorer.base.org",
  },
  // Ethereum Sepolia Testnet (optional)
  11155111: {
    id: 11155111,
    name: "Ethereum Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    explorerUrl: "https://sepolia.etherscan.io",
  },
  // Base Mainnet
  8453: {
    id: 8453,
    name: "Base Mainnet",
    rpcUrl: "https://base.rpc.thirdweb.com",
    explorerUrl: "https://basescan.org",
  },
  // Optimism Mainnet
  10: {
    id: 10,
    name: "Optimism Mainnet",
    rpcUrl: "https://optimism.rpc.thirdweb.com",
    explorerUrl: "https://optimistic.etherscan.io",
  },
  // Polygon Mainnet
  137: {
    id: 137,
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon.rpc.thirdweb.com",
    explorerUrl: "https://polygonscan.com",
  },
  // Arbitrum One
  42161: {
    id: 42161,
    name: "Arbitrum One",
    rpcUrl: "https://arbitrum.rpc.thirdweb.com",
    explorerUrl: "https://arbiscan.io",
  },
  // Avalanche Mainnet
  43114: {
    id: 43114,
    name: "Avalanche Mainnet",
    rpcUrl: "https://avalanche.rpc.thirdweb.com",
    // rpcUrl: "https://avalanche-c-chain-rpc.publicnode.com",
    explorerUrl: "https://snowtrace.io",
  },
  // Zora Mainnet
  7777777: {
    id: 7777777,
    name: "Zora Mainnet",
    rpcUrl: "https://zora.rpc.thirdweb.com",
    explorerUrl: "https://zora.scans.io",
  },
  // ZkSync Mainnet
  324: {
    id: 324,
    name: "ZkSync Mainnet",
    rpcUrl: "https://zksync.rpc.thirdweb.com",
    explorerUrl: "https://zkscan.io",
  },
};

// Helper to get chain config by ID
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return CHAINS[chainId];
}
