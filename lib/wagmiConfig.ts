import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  baseSepolia,
  sepolia,
  base,
  optimism,
  polygon,
  arbitrum,
  avalanche,
  zora,
  zkSync,
} from "viem/chains";

// Define ZetaChain Testnet manually (chainId: 7001)
const zetaTestnet = {
  id: 7001,
  name: "ZetaChain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "ZetaChain Testnet",
    symbol: "ZETA",
  },
  rpcUrls: {
    default: {
      http: ["https://zetachain-testnet.rpc.thirdweb.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "ZetaScan",
      url: "https://zetachain-testnet.explorer.thirdweb.com",
    },
  },
  testnet: true,
} as const;

// Configure supported chains: ZetaChain Testnet, Ethereum Sepolia, Base Sepolia
export const config = getDefaultConfig({
  appName: "Crypto Oracle Fortune",
  projectId:
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [
    zetaTestnet,
    baseSepolia,
    sepolia,
    base,
    optimism,
    polygon,
    arbitrum,
    avalanche,
    zora,
    zkSync,
  ],
  ssr: true, // Server-side rendering support
});
