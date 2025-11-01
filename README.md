# Crypto Oracle Fortune 🧧

A Next.js web application that connects to users' crypto wallets, retrieves token balances from multiple EVM chains, and uses AI to generate personalized "fortunes" inspired by BaZi (Chinese Four Pillars of Destiny). Users can then chat interactively with the AI oracle about their crypto destiny.

## 🎯 Features

- **Multi-Chain Wallet Connection**: Connect via MetaMask, WalletConnect, or RainbowKit
- **Token Balance Fetching**: Reads native and ERC-20 token balances from multiple chains (ZetaChain, Ethereum, Base, Optimism, Polygon, Arbitrum, Avalanche, etc.)
- **Alchemy Integration**: Fetches ERC-20 token balances and metadata via Alchemy API
- **CoinMarketCap Integration**: Primary fallback for token logos and USD price data
- **CoinGecko Integration**: Secondary fallback for token logos and USD price data
- **AI Fortune Generation**: Uses OpenAI GPT-4o-mini to generate mystical, BaZi-inspired fortunes based on wallet contents
- **Interactive Chat**: Chat with the AI oracle about your crypto fortune
- **Chat History Management**: LocalStorage-based chat persistence with free tier limits (3 chats, 5 messages per chat)
- **Beautiful UI**: Built with TailwindCSS and Framer Motion for smooth animations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **wagmi** + **RainbowKit** for wallet integration
- **Zustand** for state management

### Backend (Next.js API Routes)
- **OpenAI API** (GPT-4o-mini) for fortune generation and chat
- **Alchemy API** for ERC-20 token balance and metadata fetching
- **CoinMarketCap API** for token prices and logo fallback (primary)
- **CoinGecko API** for token prices and logo fallback (secondary)
- **ethers.js** for blockchain interactions

### Blockchain
- **ZetaChain Testnet** (Chain ID: 7001)
- **Ethereum Sepolia** (Chain ID: 11155111)
- **Base Sepolia** (Chain ID: 84532)

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
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your:
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - `OPENAI_API_KEY`
   - `ALCHEMY_API_KEY` (optional - defaults to provided key)
   - `COINMARKETCAP_API_KEY` (optional - used as fallback for token prices/logos)

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
│   │   ├── fortune/route.ts    # AI fortune generation endpoint
│   │   ├── chat/route.ts        # AI chat endpoint
│   │   └── alchemy/route.ts     # Alchemy token balance fetching endpoint
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Main page component
│   ├── Providers.tsx            # Wagmi + RainbowKit providers
│   └── globals.css              # Global styles
├── components/
│   ├── WalletConnectButton.tsx # Wallet connection UI
│   ├── TokenList.tsx           # Token display component
│   ├── FortuneCard.tsx         # Fortune display component
│   ├── ChatBox.tsx             # Chat interface component
│   ├── ChatList.tsx            # Chat session list component
│   └── Loader.tsx               # Loading spinner component
├── hooks/
│   ├── useWallet.ts            # Wallet connection hook
│   ├── useFortune.ts           # Fortune generation hook
│   └── useChat.ts              # Chat functionality hook
├── lib/
│   ├── wagmiConfig.ts          # Wagmi chain configuration
│   ├── chains.ts               # Chain definitions
│   ├── alchemy.ts              # Alchemy API configuration and utilities
│   ├── coinmarketcap.ts        # CoinMarketCap API utilities
│   ├── coingecko.ts            # CoinGecko API utilities
│   ├── chatStorage.ts          # LocalStorage utilities for chat management
│   ├── openaiClient.ts         # OpenAI client and prompts
│   ├── formatTokens.ts         # Token formatting utilities
│   └── utils.ts                # General utilities
└── store/
    ├── useAppStore.ts          # Zustand state management (tokens, fortune)
    └── useChatStore.ts         # Zustand state management (chat sessions)
```

## 🧩 How It Works

1. **Wallet Connection**: User connects their wallet via RainbowKit
2. **Balance Fetching**: 
   - App fetches native token balance using wagmi
   - App fetches ERC-20 token balances via Alchemy API (if chain is supported)
   - CoinMarketCap API is used as primary fallback for token logos and USD prices
   - CoinGecko API is used as secondary fallback if CoinMarketCap fails
3. **Token Display**: Tokens are sorted by USD value (highest first) and displayed
4. **Fortune Generation**: User clicks "Generate Fortune" → app sends top token data to OpenAI API
5. **AI Fortune**: OpenAI generates a BaZi-inspired, mystical fortune based on wallet contents
6. **Interactive Chat**: User can ask questions about their fortune, and the AI responds contextually

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

### Customizing AI Prompts

Edit `lib/openaiClient.ts` to modify the fortune and chat prompt templates.

### Changing AI Model

Edit `app/api/fortune/route.ts` and `app/api/chat/route.ts` to change the `model` parameter (e.g., `"gpt-4"`, `"gpt-4-turbo"`).

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - `OPENAI_API_KEY`
   - `ALCHEMY_API_KEY` (optional - defaults to provided key)
   - `COINMARKETCAP_API_KEY` (optional - used as fallback for token prices/logos)
4. Deploy!

## 📝 Notes

- The app fetches both native and ERC-20 token balances via Alchemy API (for supported chains).
- CoinMarketCap is used as primary fallback for token logos and USD prices.
- CoinGecko is used as secondary fallback if CoinMarketCap fails or is unavailable.
- Chat history is stored in browser localStorage (client-side only, no backend storage).
- Free tier limits: 3 chat sessions, 5 user messages per chat.
- The AI fortunes are purely entertainment and should never be considered financial advice.
- For production, consider adding rate limiting, caching, and error monitoring.
- Alchemy supports mainnet chains: Ethereum, Optimism, Polygon, Arbitrum, Base (if available).

## 🔮 Next Steps & Scalability Ideas

- [x] Add ERC-20 token balance fetching (✅ Done!)
- [x] Support more chains (Optimism, Arbitrum, etc.) (✅ Done!)
- [x] Add USD value calculations using price APIs (CoinMarketCap + CoinGecko) (✅ Done!)
- [x] Persist chat history with localStorage (✅ Done!)
- [x] Free tier limits (3 chats, 5 messages per chat) (✅ Done!)
- [ ] **Premium Membership System** (Future Enhancement)
  - User authentication system (OAuth or wallet-based)
  - Database integration (PostgreSQL/MongoDB) for persistent user accounts
  - Credit-based system for unlimited chats and messages
  - Payment integration (Stripe, crypto payments)
  - Subscription tiers (Free, Pro, Premium)
  - Usage tracking and analytics dashboard
  - API rate limiting per user tier
- [ ] Add fortune history/export feature
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Add more AI models/configurations
- [ ] Rate limiting for API routes
- [ ] Add analytics and monitoring

## 📄 License

MIT

---

Built with ❤️ for ZetaChain

