# Chipi SDK: The Fastest Way to Ship on StarkNet Mainnet

Chipi SDK combines invisible wallet creation with social login and Avnu’s paymaster to streamline dApp development on StarkNet. Users log in with familiar accounts (Google, X, Meta), and a wallet is generated behind the scenes—no manual key management needed. Focus on building features instead of dealing with blockchain complexities.

## Features

- 🔐 **Invisible Wallet Creation**: Generate wallets automatically with social login
- 💸 **Gasless Transactions**: Integration with Avnu Paymaster
- 🔄 **Simple Transfers**: Simplified API for token transfers
- ⚡ **Optimized for StarkNet**: Designed specifically for the StarkNet network

## Installation

```bash
npm install @chipi-pay/chipi-sdk

# Add your API keys to the environment variables
NEXT_PUBLIC_AVNU_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_INFURA_API_KEY=tu_infura_key_aqui
```

## Getting Started

```typescript
// app/providers.tsx

// Initialize SDK
import { ChipiProvider } from "@chipi-pay/chipi-sdk";

const AVNU_API_KEY = process.env.NEXT_PUBLIC_AVNU_API_KEY!;
const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY!;

if (!AVNU_API_KEY || !INFURA_API_KEY) {
  throw new Error("AVNU_API_KEY or INFURA_API_KEY is not set");
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChipiProvider
      config={{
        apiKey: AVNU_API_KEY,
        rpcUrl:
          `https://starknet-mainnet.infura.io/v3/${INFURA_API_KEY}`,
        network: "mainnet",
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


  const handleCreateWallet = async (pin: string) => {
    const response = await createWalletAsync(pin);
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
