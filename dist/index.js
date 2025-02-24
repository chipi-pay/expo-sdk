'use strict';

var chunkUFWQNYTR_js = require('./chunk-UFWQNYTR.js');
var gaslessSdk = require('@avnu/gasless-sdk');
var starknet = require('starknet');

var executePaymasterTransaction = async (input) => {
  try {
    const { pin, wallet, calls, rpcUrl, options } = input;
    const privateKeyDecrypted = chunkUFWQNYTR_js.decryptPrivateKey(
      wallet.encryptedPrivateKey,
      pin
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
    return null;
  }
};

// src/core/chipi-sdk.ts
var ChipiSDK = class {
  constructor(config) {
    this.options = {
      baseUrl: gaslessSdk.BASE_URL,
      apiKey: config.apiKey
    };
    this.rpcUrl = config.rpcUrl;
    this.argentClassHash = config.argentClassHash;
    this.contractAddress = config.contractAddress;
    this.contractEntryPoint = config.contractEntryPoint || "get_counter";
  }
  async createWallet(encryptKey) {
    return chunkUFWQNYTR_js.createArgentWallet({
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

Object.defineProperty(exports, "ChipiProvider", {
  enumerable: true,
  get: function () { return chunkUFWQNYTR_js.ChipiProvider; }
});
Object.defineProperty(exports, "createArgentWallet", {
  enumerable: true,
  get: function () { return chunkUFWQNYTR_js.createArgentWallet; }
});
Object.defineProperty(exports, "useChipiContext", {
  enumerable: true,
  get: function () { return chunkUFWQNYTR_js.useChipiContext; }
});
Object.defineProperty(exports, "useCreateWallet", {
  enumerable: true,
  get: function () { return chunkUFWQNYTR_js.useCreateWallet; }
});
Object.defineProperty(exports, "useSign", {
  enumerable: true,
  get: function () { return chunkUFWQNYTR_js.useSign; }
});
exports.ChipiSDK = ChipiSDK;
exports.executePaymasterTransaction = executePaymasterTransaction;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map