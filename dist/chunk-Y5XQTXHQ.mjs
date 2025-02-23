import { createContext, useContext } from 'react';
import { jsx } from 'react/jsx-runtime';
import { useMutation } from '@tanstack/react-query';
import { fetchBuildTypedData, BASE_URL, fetchExecuteTransaction } from '@avnu/gasless-sdk';
import { RpcProvider, stark, ec, CairoCustomEnum, CairoOption, CairoOptionVariant, CallData, hash, Account, num } from 'starknet';
import CryptoJS from 'crypto-js';

// src/react/context/chipi-provider.tsx
var ChipiContext = createContext(null);
function ChipiProvider({
  children,
  config
}) {
  return /* @__PURE__ */ jsx(ChipiContext.Provider, { value: { config }, children });
}
function useChipiContext() {
  const context = useContext(ChipiContext);
  if (!context) {
    throw new Error("useChipiContext must be used within a ChipiProvider");
  }
  return context;
}
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

// src/core/create-wallet.ts
var createArgentWallet = async (params) => {
  try {
    const provider = new RpcProvider({
      nodeUrl: params.rpcUrl
    });
    const privateKeyAX = stark.randomAddress();
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
    const accountClassHash = params.argentClassHash || "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
    const axSigner = new CairoCustomEnum({ Starknet: { pubkey: starkKeyPubAX } });
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
        contractAddress: params.contractAddress || "0x05039371eb9f5725bb3012934b8821ff3eb3b48cbdee3a29f798c17e9a641544",
        entrypoint: params.contractEntryPoint || "get_counter",
        calldata: [contractAddress]
      }
    ];
    const typeData = await fetchBuildTypedData(
      contractAddress,
      initialValue,
      void 0,
      void 0,
      { baseUrl: BASE_URL, apiKey: params.options.apiKey },
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
      params.options,
      deploymentData
    );
    const encryptedPrivateKey = encryptPrivateKey(privateKeyAX, params.pin);
    console.log("Encrypted private key: ", encryptedPrivateKey);
    console.log("Wallet created successfully with txHash: ", executeTransaction.transactionHash);
    console.log("Account address: ", contractAddress);
    return { success: true, accountAddress: contractAddress, txHash: executeTransaction.transactionHash };
  } catch (error) {
    console.error("Error detallado:", error);
    if (error instanceof Error && error.message.includes("SSL")) {
      throw new Error("Error de conexi\xF3n SSL. Intenta usando NODE_TLS_REJECT_UNAUTHORIZED=0 o verifica la URL del RPC");
    }
    throw new Error(`Error creating Argent wallet: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

// src/react/hooks/use-create-wallet.ts
function useCreateWallet(options) {
  const mutation = useMutation({
    mutationFn: async (pin) => {
      const wallet = await createArgentWallet({
        pin,
        // ... other params from SDK context
        rpcUrl: "https://rpc.ankr.com/starknet",
        argentClassHash: "0x07a5267d00000000000000000000000000000000000000000000000000000000",
        contractAddress: "0x07a5267d00000000000000000000000000000000000000000000000000000000",
        contractEntryPoint: "get_counter",
        options: {
          baseUrl: "https://paymaster.avnu.fi",
          apiKey: "your_api_key",
          apiPublicKey: "your_api_public_key"
        }
      });
      return {
        publicKey: wallet.accountAddress,
        // assuming accountAddress can serve as publicKey
        encryptedPrivateKey: "",
        // you'll need to get this from somewhere
        accountAddress: wallet.accountAddress,
        txHash: wallet.txHash,
        success: wallet.success
      };
    },
    onSuccess: options == null ? void 0 : options.onSuccess,
    onError: options == null ? void 0 : options.onError
  });
  return {
    createWallet: mutation.mutate,
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

export { ChipiProvider, createArgentWallet, decryptPrivateKey, useChipiContext, useCreateWallet, useSign };
//# sourceMappingURL=chunk-Y5XQTXHQ.mjs.map
//# sourceMappingURL=chunk-Y5XQTXHQ.mjs.map