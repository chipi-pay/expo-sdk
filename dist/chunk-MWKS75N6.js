'use strict';

var react = require('react');
var reactQuery = require('@tanstack/react-query');
var gaslessSdk = require('@avnu/gasless-sdk');
var starknet = require('starknet');
var CryptoJS = require('crypto-js');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var CryptoJS__default = /*#__PURE__*/_interopDefault(CryptoJS);

// src/react/context/chipi-provider.tsx
var encryptPrivateKey = (privateKey, password) => {
  if (!privateKey || !password) {
    throw new Error("Private key and password are required");
  }
  return CryptoJS__default.default.AES.encrypt(privateKey, password).toString();
};
var decryptPrivateKey = (encryptedPrivateKey, password) => {
  if (!encryptedPrivateKey || !password) {
    console.error("Encrypted private key and password are required");
    return null;
  }
  try {
    const bytes = CryptoJS__default.default.AES.decrypt(encryptedPrivateKey, password);
    const decrypted = bytes.toString(CryptoJS__default.default.enc.Utf8);
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
    const provider = new starknet.RpcProvider({
      nodeUrl: rpcUrl
    });
    const accountAX = new starknet.Account(
      provider,
      wallet.publicKey,
      privateKeyDecrypted
    );
    const typeData = await gaslessSdk.fetchBuildTypedData(
      wallet.publicKey,
      calls,
      void 0,
      void 0,
      options
    );
    const userSignature = await accountAX.signMessage(typeData);
    const executeTransaction = await gaslessSdk.fetchExecuteTransaction(
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
      baseUrl: network === "mainnet" ? gaslessSdk.BASE_URL : gaslessSdk.SEPOLIA_BASE_URL,
      apiKey
    };
    const provider = new starknet.RpcProvider({
      nodeUrl: rpcUrl
    });
    const privateKeyAX = starknet.stark.randomAddress();
    const starkKeyPubAX = starknet.ec.starkCurve.getStarkKey(privateKeyAX);
    const accountClassHash = params.argentClassHash;
    const axSigner = new starknet.CairoCustomEnum({
      Starknet: { pubkey: starkKeyPubAX }
    });
    const axGuardian = new starknet.CairoOption(starknet.CairoOptionVariant.None);
    const AXConstructorCallData = starknet.CallData.compile({
      owner: axSigner,
      guardian: axGuardian
    });
    const contractAddress = starknet.hash.calculateContractAddressFromHash(
      starkKeyPubAX,
      accountClassHash,
      AXConstructorCallData,
      0
    );
    const account = new starknet.Account(provider, contractAddress, privateKeyAX);
    console.log("Account ", { ...account });
    const initialValue = [
      {
        contractAddress: params.activateContractAddress,
        entrypoint: params.activateContractEntryPoint,
        calldata: [contractAddress]
        // , cairo.felt("Hello, from Chipi SDK!")
      }
    ];
    const typeData = await gaslessSdk.fetchBuildTypedData(
      contractAddress,
      initialValue,
      void 0,
      void 0,
      { baseUrl: gaslessSdk.BASE_URL, apiKey: options.apiKey },
      accountClassHash
    );
    const userSignature = await account.signMessage(typeData);
    const deploymentData = {
      class_hash: accountClassHash,
      salt: starkKeyPubAX,
      unique: `${starknet.num.toHex(0)}`,
      calldata: AXConstructorCallData.map((value) => starknet.num.toHex(value))
    };
    const executeTransaction = await gaslessSdk.fetchExecuteTransaction(
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
      baseUrl: gaslessSdk.BASE_URL,
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
    const amountBN = typeof amount === "string" ? BigInt(amount) * BigInt(10 ** decimals) : BigInt(amount) * BigInt(10 ** decimals);
    return starknet.cairo.uint256(amountBN);
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
var ChipiContext = react.createContext(null);
var queryClient = new reactQuery.QueryClient();
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
  return /* @__PURE__ */ jsxRuntime.jsx(ChipiContext.Provider, { value: { config, chipiSDK }, children: /* @__PURE__ */ jsxRuntime.jsx(reactQuery.QueryClientProvider, { client: queryClient, children }) });
}
function useChipiContext() {
  const context = react.useContext(ChipiContext);
  if (!context) {
    throw new Error("useChipiContext must be used within a ChipiProvider");
  }
  return context;
}
function useCreateWallet() {
  const { chipiSDK } = useChipiContext();
  const mutation = reactQuery.useMutation({
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
  const mutation = reactQuery.useMutation({
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
  const mutation = reactQuery.useMutation({
    mutationFn: (params) => chipiSDK.approve(params)
  });
  return {
    approve: mutation.mutate,
    approveAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}
function useStake() {
  const { chipiSDK } = useChipiContext();
  const mutation = reactQuery.useMutation({
    mutationFn: (params) => chipiSDK.stake(params)
  });
  return {
    stake: mutation.mutate,
    stakeAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}
function useWithdraw() {
  const { chipiSDK } = useChipiContext();
  const mutation = reactQuery.useMutation({
    mutationFn: (params) => chipiSDK.withdraw(params)
  });
  return {
    withdraw: mutation.mutate,
    withdrawAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}
function useCallAnyContract() {
  const { chipiSDK } = useChipiContext();
  const mutation = reactQuery.useMutation({
    mutationFn: (params) => chipiSDK.callAnyContract(params)
  });
  return {
    callAnyContract: mutation.mutate,
    callAnyContractAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError
  };
}

exports.ChipiProvider = ChipiProvider;
exports.ChipiSDK = ChipiSDK;
exports.createArgentWallet = createArgentWallet;
exports.executePaymasterTransaction = executePaymasterTransaction;
exports.useApprove = useApprove;
exports.useCallAnyContract = useCallAnyContract;
exports.useChipiContext = useChipiContext;
exports.useCreateWallet = useCreateWallet;
exports.useStake = useStake;
exports.useTransfer = useTransfer;
exports.useWithdraw = useWithdraw;
//# sourceMappingURL=chunk-MWKS75N6.js.map
//# sourceMappingURL=chunk-MWKS75N6.js.map