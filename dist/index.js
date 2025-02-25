'use strict';

var chunkN54CARR6_js = require('./chunk-N54CARR6.js');
var gaslessSdk = require('@avnu/gasless-sdk');
var starknet = require('starknet');

var executePaymasterTransaction = async (params) => {
  try {
    const { pin, wallet, calls, rpcUrl, options } = params;
    console.log("Params: ", params);
    const privateKeyDecrypted = chunkN54CARR6_js.decryptPrivateKey(
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
    this.contractEntryPoint = config.contractEntryPoint || "set_greeting";
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
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [{
        contractAddress: params.contractAddress,
        entrypoint: "transfer",
        calldata: [params.recipient, this.formatAmount(params.amount, params.decimals)]
      }]
    });
  }
  async approve(params) {
    return this.executeTransaction({
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [{
        contractAddress: params.contractAddress,
        entrypoint: "approve",
        calldata: [params.spender, this.formatAmount(params.amount, params.decimals)]
      }]
    });
  }
  async stake(params) {
    return this.executeTransaction({
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [{
        contractAddress: params.contractAddress,
        entrypoint: "deposit",
        calldata: [this.formatAmount(params.amount, params.decimals), params.recipient]
      }]
    });
  }
  async withdraw(params) {
    return this.executeTransaction({
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [{
        contractAddress: params.contractAddress,
        entrypoint: "withdraw",
        calldata: [this.formatAmount(params.amount, params.decimals), params.recipient]
      }]
    });
  }
  async callAnyContract(params) {
    return this.executeTransaction({
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: params.calls
    });
  }
};

Object.defineProperty(exports, "ChipiProvider", {
  enumerable: true,
  get: function () { return chunkN54CARR6_js.ChipiProvider; }
});
Object.defineProperty(exports, "createArgentWallet", {
  enumerable: true,
  get: function () { return chunkN54CARR6_js.createArgentWallet; }
});
Object.defineProperty(exports, "useChipiContext", {
  enumerable: true,
  get: function () { return chunkN54CARR6_js.useChipiContext; }
});
Object.defineProperty(exports, "useCreateWallet", {
  enumerable: true,
  get: function () { return chunkN54CARR6_js.useCreateWallet; }
});
Object.defineProperty(exports, "useSign", {
  enumerable: true,
  get: function () { return chunkN54CARR6_js.useSign; }
});
exports.ChipiSDK = ChipiSDK;
exports.executePaymasterTransaction = executePaymasterTransaction;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map