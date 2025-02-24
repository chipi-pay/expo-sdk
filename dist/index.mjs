import { decryptPrivateKey, createArgentWallet } from './chunk-2Y4LPIJH.mjs';
export { ChipiProvider, createArgentWallet, useChipiContext, useCreateWallet, useSign } from './chunk-2Y4LPIJH.mjs';
import { fetchBuildTypedData, fetchExecuteTransaction, BASE_URL } from '@avnu/gasless-sdk';
import { RpcProvider, Account } from 'starknet';

var executePaymasterTransaction = async (input) => {
  try {
    const { pin, wallet, calls, rpcUrl, options } = input;
    const privateKeyDecrypted = decryptPrivateKey(
      wallet.encryptedPrivateKey,
      pin
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
    return null;
  }
};

// src/core/chipi-sdk.ts
var ChipiSDK = class {
  constructor(config) {
    this.options = {
      baseUrl: BASE_URL,
      apiKey: config.apiKey
    };
    this.rpcUrl = config.rpcUrl;
    this.argentClassHash = config.argentClassHash;
    this.contractAddress = config.contractAddress;
    this.contractEntryPoint = config.contractEntryPoint || "get_counter";
  }
  async createWallet(encryptKey) {
    return createArgentWallet({
      encryptKey
    });
  }
  async executeTransaction(input) {
    return executePaymasterTransaction({
      ...input,
      rpcUrl: this.rpcUrl,
      options: this.options
    });
  }
};

export { ChipiSDK, executePaymasterTransaction };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map