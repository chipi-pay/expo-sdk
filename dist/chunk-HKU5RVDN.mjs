import { createContext, useContext } from 'react';
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

// src/core/send-transaction-with-paymaster.ts
var executePaymasterTransaction = async (params) => {
  try {
    const { encryptKey, wallet, calls, secretKey, apiKey, appId } = params;
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
    const typeDataResponse = await fetch("https://chipi-back-production.up.railway.app/transactions/prepare-typed-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`,
        "X-API-Key": apiKey
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
    const executeTransaction = await fetch("https://chipi-back-production.up.railway.app/transactions/execute-sponsored-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`,
        "X-API-Key": apiKey
      },
      body: JSON.stringify({
        publicKey: wallet.publicKey,
        typeData,
        userSignature: {
          r: userSignature.r.toString(),
          s: userSignature.s.toString(),
          recovery: userSignature.recovery
        },
        appId
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
    const { encryptKey, apiKey, secretKey, appId, nodeUrl } = params;
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
    const contractAddress = hash.calculateContractAddressFromHash(
      starkKeyPubAX,
      accountClassHash,
      AXConstructorCallData,
      0
    );
    const account = new Account(provider, contractAddress, privateKeyAX);
    const typeDataResponse = await fetch("https://chipi-back-production.up.railway.app/chipi-wallets/prepare-creation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`,
        "X-API-Key": apiKey
      },
      body: JSON.stringify({
        publicKey: contractAddress,
        appId
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
    const executeTransactionResponse = await fetch("https://chipi-back-production.up.railway.app/chipi-wallets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`,
        "X-API-Key": apiKey
      },
      body: JSON.stringify({
        publicKey: `${contractAddress}`,
        userSignature: {
          r: userSignature.r.toString(),
          s: userSignature.s.toString(),
          recovery: userSignature.recovery
        },
        typeData,
        appId,
        encryptedPrivateKey,
        deploymentData: {
          ...deploymentData,
          salt: `${deploymentData.salt}`,
          calldata: deploymentData.calldata.map((data) => `${data}`)
        }
      })
    });
    const executeTransaction = await executeTransactionResponse.json();
    console.log("Execute transaction: ", executeTransaction);
    if (executeTransaction.success) {
      return {
        success: true,
        txHash: executeTransaction.txHash,
        wallet: {
          publicKey: contractAddress,
          encryptedPrivateKey
        }
      };
    } else {
      return {
        success: false,
        txHash: "",
        wallet: {
          publicKey: "",
          encryptedPrivateKey: ""
        }
      };
    }
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
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.appId = config.appId;
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
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      appId: this.appId
    });
  }
  async transfer(params) {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      calls: [
        {
          contractAddress: params.contractAddress,
          entrypoint: "transfer",
          calldata: [
            params.recipient,
            this.formatAmount(params.amount, params.decimals)
          ]
        }
      ]
    });
  }
  async approve(params) {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      calls: [
        {
          contractAddress: params.contractAddress,
          entrypoint: "approve",
          calldata: [
            params.spender,
            this.formatAmount(params.amount, params.decimals)
          ]
        }
      ]
    });
  }
  async stake(params) {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      calls: [
        {
          contractAddress: params.contractAddress,
          entrypoint: "deposit",
          calldata: [
            this.formatAmount(params.amount, params.decimals),
            params.recipient
          ]
        }
      ]
    });
  }
  async withdraw(params) {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      calls: [
        {
          contractAddress: params.contractAddress,
          entrypoint: "withdraw",
          calldata: [
            this.formatAmount(params.amount, params.decimals),
            params.recipient
          ]
        }
      ]
    });
  }
  async callAnyContract(params) {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      calls: params.calls
    });
  }
  async createWallet(encryptKey) {
    return createArgentWallet({
      encryptKey,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      appId: this.appId,
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
  if (!config.apiKey || !config.secretKey || !config.appId) {
    throw new Error("Chipi SDK apiKey, secretKey and appId are required");
  }
  const chipiSDK = new ChipiSDK({
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    appId: config.appId
  });
  return /* @__PURE__ */ jsx(ChipiContext.Provider, { value: { config, chipiSDK }, children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children }) });
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
    mutationFn: async (encryptKey) => {
      const response = await chipiSDK.createWallet(encryptKey);
      if (!response || !response.wallet) {
        throw new Error("Invalid response from SDK");
      }
      return {
        success: response.success,
        txHash: response.txHash,
        wallet: {
          publicKey: typeof response.wallet === "string" ? response.wallet : response.wallet.publicKey,
          encryptedPrivateKey: response.wallet.encryptedPrivateKey
        }
      };
    }
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
    mutationFn: (params) => chipiSDK.transfer(params)
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
    mutationFn: (params) => chipiSDK.approve(params)
  });
  return {
    approve: mutation.mutate,
    approveAsync: mutation.mutateAsync,
    approveData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}
function useStake() {
  const { chipiSDK } = useChipiContext();
  const mutation = useMutation({
    mutationFn: (params) => chipiSDK.stake(params)
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
    mutationFn: (params) => chipiSDK.withdraw(params)
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
    mutationFn: (params) => chipiSDK.callAnyContract(params)
  });
  return {
    callAnyContract: mutation.mutate,
    callAnyContractAsync: mutation.mutateAsync,
    callAnyContractData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}

export { ChipiProvider, ChipiSDK, createArgentWallet, executePaymasterTransaction, useApprove, useCallAnyContract, useChipiContext, useCreateWallet, useStake, useTransfer, useWithdraw };
//# sourceMappingURL=chunk-HKU5RVDN.mjs.map
//# sourceMappingURL=chunk-HKU5RVDN.mjs.map