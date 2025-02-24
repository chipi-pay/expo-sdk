'use strict';

var react = require('react');
var reactQuery = require('@tanstack/react-query');
var jsxRuntime = require('react/jsx-runtime');
var gaslessSdk = require('@avnu/gasless-sdk');
var starknet = require('starknet');
var CryptoJS = require('crypto-js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var CryptoJS__default = /*#__PURE__*/_interopDefault(CryptoJS);

// src/react/context/chipi-provider.tsx
var ChipiContext = react.createContext(null);
var queryClient = new reactQuery.QueryClient();
function ChipiProvider({
  children,
  config
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(ChipiContext.Provider, { value: { config }, children: /* @__PURE__ */ jsxRuntime.jsx(reactQuery.QueryClientProvider, { client: queryClient, children }) });
}
function useChipiContext() {
  const context = react.useContext(ChipiContext);
  if (!context) {
    throw new Error("useChipiContext must be used within a ChipiProvider");
  }
  return context;
}
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

// src/core/create-wallet.ts
var NEXT_PUBLIC_ARGENT_CLASSHASH = "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
var NEXT_PUBLIC_CONTRACT_ADDRESS = "0x05039371eb9f5725bb3012934b8821ff3eb3b48cbdee3a29f798c17e9a641544";
var NEXT_PUBLIC_CONTRACT_ENTRY_POINT_GET_COUNTER = "get_counter";
var createArgentWallet = async (params) => {
  try {
    const { encryptKey } = params;
    const rpcUrl = "https://rpc.ankr.com/starknet";
    const options = {
      baseUrl: "https://starknet.api.avnu.fi",
      apiKey: "98564df8-122b-4708-a2d2-ea6c93b85d46"
    };
    const provider = new starknet.RpcProvider({
      nodeUrl: rpcUrl
    });
    const privateKeyAX = starknet.stark.randomAddress();
    const starkKeyPubAX = starknet.ec.starkCurve.getStarkKey(privateKeyAX);
    const accountClassHash = NEXT_PUBLIC_ARGENT_CLASSHASH;
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
        contractAddress: NEXT_PUBLIC_CONTRACT_ADDRESS,
        entrypoint: NEXT_PUBLIC_CONTRACT_ENTRY_POINT_GET_COUNTER,
        calldata: [contractAddress]
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

// src/react/hooks/use-create-wallet.ts
function useCreateWallet(options) {
  const mutation = reactQuery.useMutation({
    mutationFn: createArgentWallet,
    onSuccess: options == null ? void 0 : options.onSuccess,
    onError: options == null ? void 0 : options.onError
  });
  return {
    createWallet: mutation.mutate,
    createWalletAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    wallet: mutation.data
  };
}

// src/react/hooks/use-sign.ts
function useSign() {
  return {
    sign: () => {
      return "sign 3";
    }
  };
}

exports.ChipiProvider = ChipiProvider;
exports.createArgentWallet = createArgentWallet;
exports.decryptPrivateKey = decryptPrivateKey;
exports.useChipiContext = useChipiContext;
exports.useCreateWallet = useCreateWallet;
exports.useSign = useSign;
//# sourceMappingURL=chunk-UFWQNYTR.js.map
//# sourceMappingURL=chunk-UFWQNYTR.js.map