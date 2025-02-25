import { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { fetchBuildTypedData, fetchExecuteTransaction, BASE_URL, SEPOLIA_BASE_URL } from '@avnu/gasless-sdk';
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
    const { encryptKey, wallet, calls, rpcUrl, options } = params;
    console.log("Params: ", params);
    const privateKeyDecrypted = decryptPrivateKey(
      wallet.encryptedPrivateKey,
      encryptKey
    );
    if (!privateKeyDecrypted) {
      throw new Error("Failed to decrypt private key");
    }
    const provider = new RpcProvider({
      nodeUrl: rpcUrl
    });
    const accountAX = new Account(
      provider,
      wallet.publicKey,
      privateKeyDecrypted
    );
    const typeData = await fetchBuildTypedData(
      wallet.publicKey,
      calls,
      void 0,
      void 0,
      options
    );
    const userSignature = await accountAX.signMessage(typeData);
    const executeTransaction = await fetchExecuteTransaction(
      wallet.publicKey,
      JSON.stringify(typeData),
      userSignature,
      options
    );
    return executeTransaction.transactionHash;
  } catch (error) {
    console.error("Error sending transaction with paymaster", error);
    throw error;
  }
};
var createArgentWallet = async (params) => {
  console.log("create wallet Params: ", params);
  try {
    const { encryptKey, apiKey, network, rpcUrl } = params;
    const options = {
      baseUrl: network === "mainnet" ? BASE_URL : SEPOLIA_BASE_URL,
      apiKey
    };
    const provider = new RpcProvider({
      nodeUrl: rpcUrl
    });
    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
    const accountClassHash = params.argentClassHash;
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
    console.log("Account ", { ...account });
    const initialValue = [
      {
        contractAddress: params.activateContractAddress,
        entrypoint: params.activateContractEntryPoint,
        calldata: [contractAddress]
        // , cairo.felt("Hello, from Chipi SDK!")
      }
    ];
    const typeData = await fetchBuildTypedData(
      contractAddress,
      initialValue,
      void 0,
      void 0,
      { baseUrl: BASE_URL, apiKey: options.apiKey },
      accountClassHash
    );
    const userSignature = await account.signMessage(typeData);
    const deploymentData = {
      class_hash: accountClassHash,
      salt: starkKeyPubAX,
      unique: `${num.toHex(0)}`,
      calldata: AXConstructorCallData.map((value) => num.toHex(value))
    };
    const executeTransaction = await fetchExecuteTransaction(
      contractAddress,
      JSON.stringify(typeData),
      userSignature,
      options,
      deploymentData
    );
    const encryptedPrivateKey = encryptPrivateKey(privateKeyAX, encryptKey);
    console.log("Encrypted private key: ", encryptedPrivateKey);
    console.log(
      "Wallet created successfully with txHash: ",
      executeTransaction.transactionHash
    );
    console.log("Account address: ", contractAddress);
    return {
      success: true,
      wallet: {
        publicKey: contractAddress,
        encryptedPrivateKey
      },
      txHash: executeTransaction.transactionHash
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
    this.options = {
      baseUrl: BASE_URL,
      apiKey: config.apiKey
    };
    this.apiKey = config.apiKey;
    this.network = config.network;
    this.rpcUrl = config.rpcUrl;
    this.argentClassHash = config.argentClassHash || "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
    this.activateContractAddress = config.activateContractAddress || "0x0425fe282af8a0fce7478e06d21295fe85e57447f4f5127f80a04ef2eb6291fd";
    this.activateContractEntryPoint = config.activateContractEntryPoint || "set_greeting";
  }
  formatAmount(amount, decimals = 18) {
    const numericAmount = Number(amount);
    const multiplier = 10 ** decimals;
    const amountBN = BigInt(Math.round(numericAmount * multiplier));
    return cairo.uint256(amountBN);
  }
  async executeTransaction(input) {
    return executePaymasterTransaction({
      ...input,
      rpcUrl: this.rpcUrl,
      options: this.options
    });
  }
  async transfer(params) {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
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
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
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
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
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
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
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
      contractAddress: params.contractAddress,
      calls: params.calls,
      rpcUrl: this.rpcUrl,
      options: this.options
    });
  }
  async createWallet(encryptKey) {
    return createArgentWallet({
      encryptKey,
      rpcUrl: this.rpcUrl,
      argentClassHash: this.argentClassHash,
      activateContractAddress: this.activateContractAddress,
      activateContractEntryPoint: this.activateContractEntryPoint,
      apiKey: this.apiKey,
      network: this.network
    });
  }
};
var ChipiContext = createContext(null);
var queryClient = new QueryClient();
function ChipiProvider({
  children,
  config
}) {
  if (!config.apiKey) {
    throw new Error("Chipi SDK requires an API key");
  }
  const chipiSDK = new ChipiSDK({
    apiKey: config.apiKey,
    rpcUrl: config.rpcUrl,
    network: config.network,
    argentClassHash: config.argentClassHash,
    activateContractAddress: config.activateContractAddress,
    activateContractEntryPoint: config.activateContractEntryPoint
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
    mutationFn: (encryptKey) => chipiSDK.createWallet(encryptKey)
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
//# sourceMappingURL=chunk-57M5CPNL.mjs.map
//# sourceMappingURL=chunk-57M5CPNL.mjs.map