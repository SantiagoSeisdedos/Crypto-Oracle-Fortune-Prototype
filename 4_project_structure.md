# Project Structure

    src/
    ├── components/
    │   ├── WalletConnectButton.tsx
    │   ├── TokenList.tsx
    │   ├── FortuneCard.tsx
    │   ├── ChatBox.tsx
    │   └── Loader.tsx
    │
    ├── hooks/
    │   ├── useWallet.ts
    │   ├── useFortune.ts
    │   └── useChat.ts
    │
    ├── lib/
    │   ├── chains.ts
    │   ├── formatTokens.ts
    │   ├── openaiClient.ts
    │   └── utils.ts
    │
    ├── pages/
    │   ├── index.tsx
    │   └── api/
    │       ├── fortune.ts
    │       └── chat.ts
    │
    ├── styles/
    │   └── globals.css
    │
    └── store/
        └── useAppStore.ts

## Notes

- `api/fortune` handles the initial AI fortune request.
- `api/chat` handles follow-up chat completions.
- `useWallet` wraps wagmi hooks.
- `useFortune` manages LLM results + loading states.
