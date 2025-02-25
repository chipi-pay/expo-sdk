'use strict';

var chunkTDDQ2HKR_js = require('./chunk-TDDQ2HKR.js');


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
    const numericAmount = Number(amount);
    const multiplier = 10 ** decimals;
    const amountBN = BigInt(Math.round(numericAmount * multiplier));
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
  get: function () { return chunkTDDQ2HKR_js.ChipiProvider; }
});
Object.defineProperty(exports, "ChipiSDK", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.ChipiSDK; }
});
Object.defineProperty(exports, "createArgentWallet", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.createArgentWallet; }
});
Object.defineProperty(exports, "executePaymasterTransaction", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.executePaymasterTransaction; }
});
Object.defineProperty(exports, "useApprove", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.useApprove; }
});
Object.defineProperty(exports, "useCallAnyContract", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.useCallAnyContract; }
});
Object.defineProperty(exports, "useChipiContext", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.useChipiContext; }
});
Object.defineProperty(exports, "useCreateWallet", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.useCreateWallet; }
});
Object.defineProperty(exports, "useStake", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.useStake; }
});
Object.defineProperty(exports, "useTransfer", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.useTransfer; }
});
Object.defineProperty(exports, "useWithdraw", {
  enumerable: true,
  get: function () { return chunkTDDQ2HKR_js.useWithdraw; }
});
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map