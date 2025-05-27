# Chipi SDK: The Fastest Way to Ship on StarkNet

Chipi SDK combines invisible wallet creation with social login and Avnu's paymaster to streamline dApp development on StarkNet. Users log in with familiar accounts (Google, X, Meta), and a wallet is generated behind the scenes—no manual key management needed. Focus on building features instead of dealing with blockchain complexities.

## Features

- 🔐 **Invisible Wallet Creation**: Generate wallets automatically with social login
- 💸 **Gasless Transactions**: Integration with Avnu Paymaster
- 🔄 **Simple Transfers**: Simplified API for token transfers
- ⚡ **Optimized for StarkNet**: Designed specifically for the StarkNet network

## Example Repo

https://github.com/chipi-pay/chipi-expo-sdk-example

## Installation

### Create an Org in the Dashboard

https://dashboard.chipipay.com/

### Bring your own Auth Provider

Next, head to https://dashboard.chipipay.com/configure and add your JWKS Endpoint from your Auth Provider. 

We will use this to verify the Bearer Tokens from your Auth Provider used in your frontend.

After adding the JWKS Endpoint, you will get a Public Key (pk_prod_xxxx). You will need this to initialize the SDK.

### Install the SDK

```bash
npm install @chipi-pay/chipi-expo
```

## Getting Started

```typescript
// app/_layout.tsx

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ChipiProvider
        config={{
          apiPublicKey: "pk_prod_7ba19d352226d43ac92a4a8132a5917c",
        }}
      >
        <Slot />
      </ChipiProvider>
    </ClerkProvider>
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
