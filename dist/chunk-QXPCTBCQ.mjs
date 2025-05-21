import { createContext, useMemo, useContext } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { RpcProvider, Account, stark, ec, CairoCustomEnum, CairoOption, CairoOptionVariant, CallData, hash, num, cairo } from 'starknet';
import CryptoJS from 'crypto-js';
import { jsx } from 'react/jsx-runtime';

// src/react/context/chipi-provider.tsx
var encryptPrivateKey = (privateKey, password) => {
  if (!privateKey || !password) {
    throw new Error("Private key and password are required");
  }
  return CryptoJS.AES.encrypt(privateKey, password).toString();
};
var decryptPrivateKey = (encryptedPrivateKey, password) => {
  if (!encryptedPrivateKey || !password) {
    console.error("Encrypted private key and password are required");
    return null;
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      return null;
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

// src/core/backend-url.ts
var BACKEND_URL = "http://localhost:3000";

// src/core/send-transaction-with-paymaster.ts
var executePaymasterTransaction = async (params) => {
  try {
    const { encryptKey, wallet, calls, apiPublicKey, bearerToken } = params;
    console.log("Params: ", params);
    const privateKeyDecrypted = decryptPrivateKey(
      wallet.encryptedPrivateKey,
      encryptKey
    );
    if (!privateKeyDecrypted) {
      throw new Error("Failed to decrypt private key");
    }
    const provider = new RpcProvider({
      nodeUrl: "https://cloud.argent-api.com/v1/starknet/mainnet/rpc/v0.7"
    });
    const account = new Account(
      provider,
      wallet.publicKey,
      privateKeyDecrypted
    );
    const typeDataResponse = await fetch(`${BACKEND_URL}/transactions/prepare-typed-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`,
        "X-API-Key": apiPublicKey
      },
      body: JSON.stringify({
        publicKey: wallet.publicKey,
        calls,
        accountClassHash: "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f"
      })
    });
    if (!typeDataResponse.ok) {
      const errorText = await typeDataResponse.text();
      throw new Error(`Error en la API: ${errorText}`);
    }
    const typeData = await typeDataResponse.json();
    const userSignature = await account.signMessage(typeData);
    const executeTransaction = await fetch(`${BACKEND_URL}/transactions/execute-sponsored-transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`,
        "X-API-Key": apiPublicKey
      },
      body: JSON.stringify({
        publicKey: wallet.publicKey,
        typeData,
        userSignature: {
          r: userSignature.r.toString(),
          s: userSignature.s.toString(),
          recovery: userSignature.recovery
        }
      })
    });
    if (!executeTransaction.ok) {
      const errorText = await executeTransaction.text();
      throw new Error(`Error en la API de ejecuci\xF3n: ${errorText}`);
    }
    const result = await executeTransaction.json();
    if (!result.transactionHash) {
      throw new Error("La respuesta no contiene el hash de la transacci\xF3n");
    }
    return result.transactionHash;
  } catch (error) {
    console.error("Error sending transaction with paymaster", error);
    throw error;
  }
};
var createArgentWallet = async (params) => {
  try {
    const { encryptKey, apiPublicKey, bearerToken, nodeUrl } = params;
    const provider = new RpcProvider({ nodeUrl });
    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
    const accountClassHash = "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
    const axSigner = new CairoCustomEnum({
      Starknet: { pubkey: starkKeyPubAX }
    });
    const axGuardian = new CairoOption(CairoOptionVariant.None);
    const AXConstructorCallData = CallData.compile({
      owner: axSigner,
      guardian: axGuardian
    });
    const publicKey = hash.calculateContractAddressFromHash(
      starkKeyPubAX,
      accountClassHash,
      AXConstructorCallData,
      0
    );
    const account = new Account(provider, publicKey, privateKeyAX);
    console.log("apiPublicKey", apiPublicKey);
    const typeDataResponse = await fetch(`${BACKEND_URL}/chipi-wallets/prepare-creation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`,
        "x-api-key": apiPublicKey
      },
      body: JSON.stringify({
        publicKey
      })
    });
    const { typeData, accountClassHash: accountClassHashResponse } = await typeDataResponse.json();
    const userSignature = await account.signMessage(typeData);
    const deploymentData = {
      class_hash: accountClassHashResponse,
      salt: starkKeyPubAX,
      unique: `${num.toHex(0)}`,
      calldata: AXConstructorCallData.map((value) => num.toHex(value))
    };
    const encryptedPrivateKey = encryptPrivateKey(privateKeyAX, encryptKey);
    const executeTransactionResponse = await fetch(`${BACKEND_URL}/chipi-wallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`,
        "x-api-key": apiPublicKey
      },
      body: JSON.stringify({
        apiPublicKey,
        publicKey,
        userSignature: {
          r: userSignature.r.toString(),
          s: userSignature.s.toString(),
          recovery: userSignature.recovery
        },
        typeData,
        encryptedPrivateKey,
        deploymentData: {
          ...deploymentData,
          salt: `${deploymentData.salt}`,
          calldata: deploymentData.calldata.map((data) => `${data}`)
        }
      })
    });
    const executeTransaction = await executeTransactionResponse.json();
    return {
      success: true,
      txHash: executeTransaction.txHash,
      wallet: {
        publicKey: executeTransaction.walletPublicKey,
        encryptedPrivateKey
      }
    };
  } catch (error) {
    console.error("Error detallado:", error);
    if (error instanceof Error && error.message.includes("SSL")) {
      throw new Error(
        "Error de conexi\xF3n SSL. Intenta usando NODE_TLS_REJECT_UNAUTHORIZED=0 o verifica la URL del RPC"
      );
    }
    throw new Error(
      `Error creating Argent wallet: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// src/core/chipi-sdk.ts
var ChipiSDK = class {
  constructor(config) {
    this.nodeUrl = "https://starknet-mainnet.public.blastapi.io/rpc/v0_7";
    this.apiPublicKey = config.apiPublicKey;
    this.executeTransaction = this.executeTransaction.bind(this);
    this.transfer = this.transfer.bind(this);
    this.approve = this.approve.bind(this);
    this.stakeVesuUsdc = this.stakeVesuUsdc.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.callAnyContract = this.callAnyContract.bind(this);
    this.createWallet = this.createWallet.bind(this);
  }
  formatAmount(amount, decimals = 18) {
    const amountStr = amount.toString();
    const [integerPart, decimalPart = ""] = amountStr.split(".");
    const paddedDecimal = decimalPart.padEnd(decimals, "0").slice(0, decimals);
    const amountBN = BigInt(integerPart + paddedDecimal);
    return cairo.uint256(amountBN);
  }
  async executeTransaction(input) {
    return executePaymasterTransaction({
      ...input,
      apiPublicKey: this.apiPublicKey
    });
  }
  async transfer(params) {
    const { encryptKey, wallet, contractAddress, recipient, amount, decimals, bearerToken } = params;
    console.log("transfer this format test", this.formatAmount(amount, decimals));
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls: [
        {
          contractAddress,
          entrypoint: "transfer",
          calldata: [
            recipient,
            this.formatAmount(amount, decimals),
            "0x0"
          ]
        }
      ]
    });
  }
  async approve(params) {
    const { encryptKey, wallet, contractAddress, spender, amount, decimals, bearerToken } = params;
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls: [
        {
          contractAddress,
          entrypoint: "approve",
          calldata: [
            spender,
            this.formatAmount(amount, decimals),
            "0x0"
          ]
        }
      ]
    });
  }
  async stakeVesuUsdc(params) {
    const { encryptKey, wallet, amount, receiverWallet, bearerToken } = params;
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls: [
        {
          contractAddress: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          entrypoint: "approve",
          calldata: [
            "0x017f19582c61479f2fe0b6606300e975c0a8f439102f43eeecc1d0e9b3d84350",
            this.formatAmount(amount, 6),
            "0x0"
          ]
        },
        {
          contractAddress: "0x017f19582c61479f2fe0b6606300e975c0a8f439102f43eeecc1d0e9b3d84350",
          entrypoint: "deposit",
          calldata: [
            this.formatAmount(amount, 6),
            "0x0",
            receiverWallet
          ]
        }
      ]
    });
  }
  async withdraw(params) {
    const { encryptKey, wallet, contractAddress, amount, recipient, decimals, bearerToken } = params;
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls: [
        {
          contractAddress,
          entrypoint: "withdraw",
          calldata: [
            this.formatAmount(amount, decimals),
            recipient,
            "0x0"
          ]
        }
      ]
    });
  }
  async callAnyContract(params) {
    const { encryptKey, wallet, contractAddress, calls, bearerToken } = params;
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls
    });
  }
  async createWallet(params) {
    const { encryptKey, bearerToken } = params;
    return createArgentWallet({
      encryptKey,
      apiPublicKey: this.apiPublicKey,
      bearerToken,
      nodeUrl: this.nodeUrl
    });
  }
};
var ChipiContext = createContext(null);
var queryClient = new QueryClient();
function ChipiProvider({
  children,
  config
}) {
  if (!config.apiPublicKey) {
    throw new Error("Chipi SDK apiPublicKey is required");
  }
  const chipiSDK = useMemo(() => {
    console.log("Creating new ChipiSDK instance with apiPublicKey:", config.apiPublicKey);
    return new ChipiSDK({
      apiPublicKey: config.apiPublicKey
    });
  }, [config.apiPublicKey]);
  const contextValue = useMemo(() => ({
    config,
    chipiSDK
  }), [config, chipiSDK]);
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(ChipiContext.Provider, { value: contextValue, children }) });
}
function useChipiContext() {
  const context = useContext(ChipiContext);
  if (!context) {
    throw new Error("useChipiContext must be used within a ChipiProvider");
  }
  return context;
}
function useCreateWallet() {
  const { chipiSDK } = useChipiContext();
  const mutation = useMutation({
    mutationFn: chipiSDK.createWallet
  });
  return {
    createWallet: mutation.mutate,
    createWalletAsync: mutation.mutateAsync,
    createWalletResponse: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}
function useTransfer() {
  const { chipiSDK } = useChipiContext();
  const mutation = useMutation({
    mutationFn: chipiSDK.transfer
  });
  return {
    transfer: mutation.mutate,
    transferAsync: mutation.mutateAsync,
    transferData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}
function useApprove() {
  const { chipiSDK } = useChipiContext();
  const mutation = useMutation({
    mutationFn: chipiSDK.approve
  });
  return {
    approve: mutation.mutate,
    approveAsync: mutation.mutateAsync,
    approveData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}
function useStakeVesuUsdc() {
  const { chipiSDK } = useChipiContext();
  const mutation = useMutation({
    mutationFn: chipiSDK.stakeVesuUsdc
  });
  return {
    stake: mutation.mutate,
    stakeAsync: mutation.mutateAsync,
    stakeData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}
function useWithdraw() {
  const { chipiSDK } = useChipiContext();
  const mutation = useMutation({
    mutationFn: chipiSDK.withdraw
  });
  return {
    withdraw: mutation.mutate,
    withdrawAsync: mutation.mutateAsync,
    withdrawData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}
function useCallAnyContract() {
  const { chipiSDK } = useChipiContext();
  const mutation = useMutation({
    mutationFn: chipiSDK.callAnyContract
  });
  return {
    callAnyContract: mutation.mutate,
    callAnyContractAsync: mutation.mutateAsync,
    callAnyContractData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}

export { ChipiProvider, ChipiSDK, createArgentWallet, executePaymasterTransaction, useApprove, useCallAnyContract, useChipiContext, useCreateWallet, useStakeVesuUsdc, useTransfer, useWithdraw };
//# sourceMappingURL=chunk-QXPCTBCQ.mjs.map
//# sourceMappingURL=chunk-QXPCTBCQ.mjs.map