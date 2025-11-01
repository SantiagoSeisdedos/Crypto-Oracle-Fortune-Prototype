# Solution Design

## 🧭 Architecture Overview

We'll build a full-stack TypeScript app using:

- **Frontend:** Next.js (React framework with built-in API routes)
- **Backend:** Next.js API routes (no separate backend needed for MVP)
- **Blockchain Integration:** `ethers.js` + `wagmi` + `RainbowKit`
- **LLM Integration:** `OpenAI API` for fortune generation and chat
- **Styling:** `TailwindCSS` + `Framer Motion` for clean, animated UI
- **State Management:** `Zustand` (simple global store)
- **Deployment:** `Vercel`

---

## 🧩 User Flow

1. **Connect Wallet** → User connects via RainbowKit (MetaMask / WalletConnect)
2. **Retrieve Balances** → Fetch tokens on ZetaChain + 2 EVMs (e.g. ETH, Base)
3. **Generate Fortune** → Call OpenAI API with wallet summary
4. **Display Fortune** → Show styled card with LLM’s BaZi-inspired message
5. **Chat with AI** → Allow conversation based on previous fortune
6. **(Optional)** Store chat logs locally (or in MongoDB later)

---

## 🧠 Key Design Decisions

- Using **Next.js** for SSR, easy API routing, and fast deploy.
- Keeping **backend inside Next.js** to simplify MVP delivery.
- **ZetaChain** as required integration + **multi-chain** (ETH, Base, Optimism).
- Focus: deliver a **polished experience**, not just data display.
- Scalable: easily migrate API routes to NestJS or external service later.
