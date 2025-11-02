# Crypto Oracle Fortune 🧧

A Next.js web application that connects to users' crypto wallets, retrieves token balances from multiple EVM chains, and uses AI to generate personalized "fortunes" inspired by BaZi (Chinese Four Pillars of Destiny). Users can then chat interactively with the AI oracle about their crypto destiny.

## ✅ Challenge Completion Status

This MVP successfully implements **all required features** and **bonus features** from the ZetaChain Product Engineering Challenge:

### ✅ Core Requirements (All Complete)

- ✅ **Frontend wallet integration** - MetaMask, WalletConnect, and RainbowKit support
- ✅ **Wallet address display** - Shows connected wallet address
- ✅ **Read token balances** - Fetches native and ERC-20 tokens from multiple EVM chains using wagmi/viem
- ✅ **Display top tokens** - Token list sorted by USD value with chain information
- ✅ **LLM API integration** - OpenAI GPT-4o-mini for fortune generation
- ✅ **Personalized fortunes** - BaZi-inspired mystical interpretations of wallet contents
- ✅ **Interactive chat** - Users can ask questions about their fortune, answered by LLM
- ✅ **Clear code architecture** - Well-organized Next.js/TypeScript structure with comments

### ✅ Bonus Features (All Complete)

- ✅ **Loading/error states** - Comprehensive loading indicators and error handling
- ✅ **Responsive/mobile adaptations** - Fully responsive design with mobile-first approach
- ✅ **Code documentation** - This README with architecture and decision notes

### ✅ Additional Enhancements

- ✅ **Multi-chain support** - 10+ EVM-compatible chains (ZetaChain, Ethereum, Base, Optimism, Polygon, Arbitrum, Avalanche, Zora, zkSync)
- ✅ **Token metadata enrichment** - Li.Fi API integration for comprehensive token data
- ✅ **Chain logos and filtering** - Visual chain identification with filterable token views
- ✅ **Chat history management** - LocalStorage-based persistence with multiple chat sessions
- ✅ **Optimized API architecture** - Consolidated balances API reducing API calls and costs
- ✅ **Caching system** - Token and chain metadata caching for improved performance
- ✅ **Welcome CTA** - Beautiful onboarding experience for new users
- ✅ **Performance optimizations** - Custom logger, code cleanup, and production-ready build

## 🎯 Features

- **Multi-Chain Wallet Connection**: Connect via MetaMask, WalletConnect, or RainbowKit
- **Token Balance Fetching**: Reads native and ERC-20 token balances from multiple chains (ZetaChain, Ethereum, Base, Optimism, Polygon, Arbitrum, Avalanche, Zora, zkSync)
- **Optimized API Architecture**: Consolidated `/api/balances` endpoint that fetches balances across all chains in parallel and enriches with Li.Fi metadata
- **Token Metadata Enrichment**: Li.Fi API integration for comprehensive token logos, prices, and metadata
- **CoinMarketCap Integration**: Primary fallback for token logos and USD price data
- **CoinGecko Integration**: Secondary fallback for token logos and USD price data
- **AI Fortune Generation**: Uses OpenAI GPT-4o-mini to generate mystical, BaZi-inspired fortunes based on wallet contents
- **Interactive Chat**: Chat with the AI oracle about your crypto fortune with message history
- **Chat History Management**: LocalStorage-based chat persistence with free tier limits (3 chats, 5 AI messages per chat)
- **Chain Filtering**: Filter tokens by specific chain or view all chains together
- **Responsive Design**: Beautiful UI built with TailwindCSS and Framer Motion, fully optimized for mobile and desktop
- **Welcome Experience**: Eye-catching CTA component for new users without connected wallets

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **wagmi** + **RainbowKit** for wallet integration (modern alternative to ethers.js)
- **Zustand** for state management with persistence

### Backend (Next.js API Routes)

- **OpenAI API** (GPT-4o-mini) for fortune generation and chat
- **Alchemy API** for ERC-20 token balance fetching across multiple chains
- **Li.Fi API** for comprehensive token metadata (logos, prices, symbols)
- **CoinMarketCap API** for token prices and logo fallback (primary)
- **CoinGecko API** for token prices and logo fallback (secondary)

### Blockchain

- **ZetaChain Testnet** (Chain ID: 7001)
- **Ethereum Sepolia** (Chain ID: 11155111)
- **Base Sepolia** (Chain ID: 84532)
- **Base Mainnet** (Chain ID: 8453)
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon Mainnet** (Chain ID: 137)
- **Optimism Mainnet** (Chain ID: 10)
- **Arbitrum Mainnet** (Chain ID: 42161)
- **Avalanche Mainnet** (Chain ID: 43114)
- **Zora Mainnet** (Chain ID: 7777777)
- **zkSync Mainnet** (Chain ID: 324)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (Node 20.18.0+ recommended)
- npm or yarn
- WalletConnect Project ID ([Get one here](https://cloud.walletconnect.com))
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))
- Alchemy API Key ([Get one here](https://dashboard.alchemy.com/)) - Optional, defaults to provided key
- CoinMarketCap API Key ([Get one here](https://coinmarketcap.com/api/)) - Optional, used as fallback for token prices/logos

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ZetaChain
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```bash
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   OPENAI_API_KEY=your_openai_api_key
   ALCHEMY_API_KEY=your_alchemy_api_key  # Optional
   COINMARKETCAP_API_KEY=your_coinmarketcap_api_key  # Optional
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── balances/
│   │   │   └── route.ts           # Consolidated balances API (multi-chain + metadata)
│   │   ├── fortune/
│   │   │   └── route.ts           # AI fortune generation endpoint
│   │   ├── chat/
│   │   │   └── route.ts            # AI chat endpoint
│   │   └── native-token-metadata/
│   │       └── route.ts            # Native token metadata from Li.Fi
│   ├── layout.tsx                  # Root layout with providers and favicon
│   ├── page.tsx                    # Main page component
│   ├── Providers.tsx               # Wagmi + RainbowKit providers
│   └── globals.css                 # Global styles
├── components/
│   ├── WalletConnectButton.tsx    # Wallet connection UI
│   ├── TokenList.tsx              # Token display component with hover tooltips
│   ├── TokenSidebar.tsx           # Token sidebar with chain filtering
│   ├── ChatBox.tsx                # Chat interface component with auto-resize input
│   ├── ChatListItem.tsx          # Chat session list item
│   ├── WelcomeCTA.tsx             # Welcome component for disconnected users
│   └── Loader.tsx                 # Loading spinner component
├── hooks/
│   ├── useWallet.ts               # Wallet connection and token fetching hook
│   ├── useFortune.ts             # Fortune generation hook
│   └── useChat.ts                # Chat functionality hook
├── lib/
│   ├── wagmiConfig.ts            # Wagmi chain configuration
│   ├── chains.ts                # Chain definitions with logos and metadata
│   ├── alchemy.ts               # Alchemy API configuration and utilities
│   ├── lifi.ts                  # Li.Fi API utilities for token metadata
│   ├── coinmarketcap.ts         # CoinMarketCap API utilities
│   ├── coingecko.ts             # CoinGecko API utilities
│   ├── openaiClient.ts          # OpenAI client and prompts
│   ├── logger.ts                # Custom logging utility (dev only)
│   └── utils.ts                 # General utilities
├── store/
│   ├── useAppStore.ts           # Zustand state management (tokens, cache)
│   └── useChatStore.ts          # Zustand state management (chat sessions)
└── public/
    └── images/
        ├── oraculo.jpeg         # App favicon
        └── token.jpg             # Token fallback image
```

## 🧩 How It Works

### 1. Wallet Connection

User connects their wallet via RainbowKit (supports MetaMask, WalletConnect, and other popular wallets).

### 2. Balance Fetching (Optimized Flow)

- App calls `/api/balances` endpoint with wallet address
- Backend fetches balances from **all supported chains in parallel** via Alchemy API
- Backend enriches token data with metadata from **Li.Fi API** (logos, prices, symbols)
- Falls back to CoinMarketCap and CoinGecko if needed
- Returns consolidated token list with chain information

### 3. Token Display

- Tokens are sorted by USD value (highest first)
- Chain logos displayed for visual identification
- Filter tokens by specific chain or view all chains
- Hover tooltips show full, unformatted balances
- Dynamic font sizing for long numbers

### 4. Fortune Generation

- User clicks "Generate Fortune" button
- App sends top token data to OpenAI API
- OpenAI generates a BaZi-inspired, mystical fortune (2-3 paragraphs, max 200 words)
- Fortune is stored with the chat session

### 5. Interactive Chat

- User can ask questions about their fortune
- Each chat session maintains context (fortune + tokens)
- Messages are grouped by date with visual separators
- Chat history persisted in localStorage
- Free tier: 3 chats maximum, 5 AI messages per chat

### 6. Performance Optimizations

- **Custom logger**: Only logs in development, reduces production overhead
- **Caching**: Token and chain metadata cached with 24-hour expiry
- **Consolidated API**: Single `/api/balances` call instead of multiple chain-specific calls
- **Code cleanup**: Removed unused code, optimized imports, improved readability

## 🏗️ Architecture Decisions

### Why wagmi/viem instead of ethers.js?

- **Modern TypeScript-first** library with better type safety
- **React hooks integration** makes wallet interactions cleaner
- **Built-in support** for multiple chains and wallet connectors
- **Better performance** with optimized RPC calls
- **Active maintenance** and strong community support

### Why consolidated `/api/balances` endpoint?

- **Reduces API calls** by fetching all chains in parallel
- **Lower costs** by minimizing Alchemy API usage
- **Better UX** with single loading state instead of multiple
- **Simpler frontend** code with one API call instead of many

### Why Li.Fi API for token metadata?

- **Comprehensive data** in single API call (logo, price, symbol, name)
- **Multi-chain support** built-in
- **Reliable fallbacks** when CoinMarketCap/CoinGecko unavailable
- **Better coverage** for native tokens across chains

### Why Zustand for state management?

- **Lightweight** alternative to Redux
- **Built-in persistence** middleware for localStorage
- **Simple API** with hooks pattern
- **TypeScript support** out of the box
- **Perfect for MVP** without over-engineering

### Why LocalStorage for chat persistence?

- **No backend required** for MVP
- **Fast and simple** implementation
- **Privacy-focused** (data stays in browser)
- **Sufficient for free tier** limits (3 chats, 5 messages)

## 🔧 Configuration

### Adding More Chains

Edit `lib/wagmiConfig.ts` to add more chains:

```typescript
import { yourChain } from "viem/chains";

export const config = getDefaultConfig({
  // ...
  chains: [zetaTestnet, sepolia, baseSepolia, yourChain],
});
```

Then add chain configuration in `lib/chains.ts`:

```typescript
export const CHAINS: ChainConfig[] = [
  // ... existing chains
  {
    chainId: yourChain.id,
    name: yourChain.name,
    logo: "/path/to/logo.png", // Optional: hardcoded logo
  },
];
```

### Customizing AI Prompts

Edit `lib/openaiClient.ts` to modify the fortune and chat prompt templates.

### Changing AI Model

Edit `app/api/fortune/route.ts` and `app/api/chat/route.ts` to change the `model` parameter (e.g., `"gpt-4"`, `"gpt-4-turbo"`).

## 📝 Notes

- The app fetches both native and ERC-20 token balances via Alchemy API (for supported chains).
- Li.Fi API provides comprehensive token metadata including logos and USD prices.
- CoinMarketCap is used as primary fallback for token logos and USD prices.
- CoinGecko is used as secondary fallback if CoinMarketCap fails or is unavailable.
- Chat history is stored in browser localStorage (client-side only, no backend storage).
- Free tier limits: 3 chat sessions, 5 AI messages per chat (first fortune counts as 1 message).
- The AI fortunes are purely entertainment and should never be considered financial advice.
- For production, consider adding rate limiting, caching, and error monitoring.
- Custom logger only outputs in development mode for better production performance.

## 🔮 Next Steps & Scalability Ideas

### ✅ Completed Features

- [x] Add ERC-20 token balance fetching
- [x] Support more chains (Optimism, Arbitrum, etc.)
- [x] Add USD value calculations using price APIs (Li.Fi + CoinMarketCap + CoinGecko)
- [x] Persist chat history with localStorage
- [x] Free tier limits (3 chats, 5 messages per chat)
- [x] Multi-chain token aggregation and display
- [x] Chain filtering and visual identification
- [x] Optimized API architecture
- [x] Performance optimizations (logging, caching, code cleanup)
- [x] Responsive design and mobile optimization
- [x] Welcome experience for new users

### 🚀 Future Enhancements

- [ ] **Premium Membership System**
  - User authentication system (OAuth or wallet-based)
  - Database integration (PostgreSQL/MongoDB) for persistent user accounts
  - Credit-based system for unlimited chats and messages
  - Payment integration (Stripe, crypto payments)
  - Subscription tiers (Free, Pro, Premium, Pay as you go)
  - Usage tracking and analytics dashboard
  - API rate limiting per user tier
- [ ] Add fortune history/export feature
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Add more AI models/configurations
- [ ] Rate limiting for API routes
- [ ] Add analytics and monitoring (Sentry, etc.)
- [ ] Server-side chat persistence
- [ ] WebSocket support for real-time chat updates

## 📄 License

MIT

---

**Built with ❤️ for ZetaChain**

**Challenge completed: All requirements and bonus features implemented!** ✅
