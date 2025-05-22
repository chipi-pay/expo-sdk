# Chipi SDK: The Fastest Way to Ship on StarkNet

Chipi SDK combines invisible wallet creation with social login and Avnu's paymaster to streamline dApp development on StarkNet. Users log in with familiar accounts (Google, X, Meta), and a wallet is generated behind the scenes—no manual key management needed. Focus on building features instead of dealing with blockchain complexities.

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

### Bring your own Auth Provider

Next, head to https://dashboard.chipipay.com/configure and add your JWKS Endpoint from your Auth Provider. 

We will use this to verify the Bearer Tokens from your Auth Provider used in your frontend.

After adding the JWKS Endpoint, you will get a Public Key (pk_prod_xxxx). You will need this to initialize the SDK.

### Install the SDK

```bash
npm install @chipi-pay/chipi-sdk
```

## Getting Started

```typescript
// app/providers.tsx
"use client";

import { ChipiProvider } from "@chipi-pay/chipi-sdk";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChipiProvider
      config={{
        apiPublicKey: "pk_prod_5fc889d9527c24b9657b9c28399e91d4",
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
