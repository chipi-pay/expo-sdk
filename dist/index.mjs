<<<<<<< HEAD
export { ChipiProvider, ChipiSDK, createArgentWallet, executePaymasterTransaction, useApprove, useCallAnyContract, useChipiContext, useCreateWallet, useStake, useTransfer, useWithdraw } from './chunk-STADIA7K.mjs';
=======
import { decryptPrivateKey } from './chunk-777TFSLR.mjs';
export { ChipiProvider, createArgentWallet, useChipiContext, useCreateWallet, useSign } from './chunk-777TFSLR.mjs';
import { fetchBuildTypedData, fetchExecuteTransaction, BASE_URL } from '@avnu/gasless-sdk';
import { RpcProvider, Account, cairo } from 'starknet';

var executePaymasterTransaction = async (params) => {
  try {
    const { pin, wallet, calls, rpcUrl, options } = params;
    console.log("Params: ", params);
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
    this.contractEntryPoint = config.contractEntryPoint || "set_greeting";
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

export { ChipiSDK, executePaymasterTransaction };
>>>>>>> 3f36457 (fix format amount)
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map