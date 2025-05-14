# Chipi SDK: The Fastest Way to Ship on StarkNet Mainnet

Chipi SDK combines invisible wallet creation with social login and Avnu’s paymaster to streamline dApp development on StarkNet. Users log in with familiar accounts (Google, X, Meta), and a wallet is generated behind the scenes—no manual key management needed. Focus on building features instead of dealing with blockchain complexities.

## Features

- 🔐 **Invisible Wallet Creation**: Generate wallets automatically with social login
- 💸 **Gasless Transactions**: Integration with Avnu Paymaster
- 🔄 **Simple Transfers**: Simplified API for token transfers
- ⚡ **Optimized for StarkNet**: Designed specifically for the StarkNet network

## Live Demo

https://chipi-sdk-clerk-demo.vercel.app/

## Installation

### Create an Org in the Dashboard

https://dashboard.chipipay.com/

```bash
npm install @chipi-pay/chipi-sdk

# Add your API keys to the environment variables
NEXT_PUBLIC_CHIPI_PUBLIC_KEY=your_public_key
NEXT_PUBLIC_CHIPI_APP_ID=your_app_id
CHIPI_SECRET_KEY=your_secret_key
```

## Getting Started

```typescript
// app/providers.tsx

// Initialize SDK
import { ChipiProvider } from "@chipi-pay/chipi-sdk";

const CHIPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CHIPI_PUBLIC_KEY!;
const CHIPI_APP_ID = process.env.NEXT_PUBLIC_CHIPI_APP_ID!;
const CHIPI_SECRET_KEY = process.env.CHIPI_SECRET_KEY!;

if (!CHIPI_PUBLIC_KEY || !CHIPI_APP_ID || !CHIPI_SECRET_KEY) {
  throw new Error("Some Key is not set");
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChipiProvider
      config={{
        apiKey: "CHIPI_PUBLIC_KEY",
        secretKey: "CHIPI_SECRET_KEY",
        appId: "CHIPI_APP_ID"
      }}
    >
      {children}
    </ChipiProvider>
  );
}
```

```typescript
// app/page.tsx
import {
  useApprove,
  useStake,
  useCreateWallet,
  useTransfer,
  useWithdraw,
  useCallAnyContract,
} from "@chipi-pay/chipi-sdk";

export default function Home() {
  const { createWalletAsync, createWalletResponse } =
    useCreateWallet();
  const { transferAsync } = useTransfer();


  const handleCreateWallet = async (encryptKey: string) => { // PIN 01234
    const response = await createWalletAsync(encryptKey);
    console.log("creation response", response);
    alert("Wallet created");
  };

  const handleTransfer = async (params: TransferParams) => {
    const response = await transferAsync(params);
    console.log("transfer response", response);
    alert("Transferred");
  };

  return (
    <div>
      <h1>Chipi SDK</h1>
      <button onClick={handleCreateWallet}>Create Wallet</button>
      <button onClick={handleTransfer}>Transfer</button>
    </div>
  );
}
```

## API

If you need to do something more customized, you can check our API

https://chipi-back-production.up.railway.app/api

## Types

```typescript
interface ChipiSDKConfig {
  apiKey: string;
  rpcUrl: string;
  argentClassHash?: string;
  activateContractAddress?: string;
  activateContractEntryPoint?: string;
  network: "mainnet" | "sepolia";
}

interface WalletData {
  publicKey: string;
  encryptedPrivateKey: string;
}

interface TransferParams {
  encryptKey: string;
  wallet: WalletData;
  contractAddress: string;
  recipient: string;
  amount: string | number;
  decimals?: number;
}
```
