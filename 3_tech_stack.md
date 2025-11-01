# Tech Stack

## 🌐 Frontend

- Framework: **Next.js 15** (React + TypeScript)
- UI: **TailwindCSS**, **Framer Motion**
- Wallets: **RainbowKit + wagmi + ethers.js**
- State: **Zustand**
- API Calls: **Axios / Fetch**

## ⚙️ Backend (within Next.js)

- Runtime: Node.js 20+
- Libraries: `ethers`, `openai`, `axios`
- Optional: `mongodb` or `supabase-js` for persistence

## 🧩 LLM Integration

- Primary: **OpenAI GPT-4** (or GPT-4-mini)
- Backup: **OpenRouter API**
- Purpose: Generate “fortunes” and respond to chat questions

## 🔗 Blockchain

- Core: **ZetaChain Testnet**
- Additional: **Ethereum**, **Base**, **Optimism**
- SDK: `ethers.js` (multichain provider setup)

## 🚀 Deployment

- **Vercel** for frontend + API
- **MongoDB Atlas** if needed
