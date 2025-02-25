import { BASE_URL, GaslessOptions } from "@avnu/gasless-sdk";
import { cairo, type Call, type Uint256 } from "starknet";
import { executePaymasterTransaction, ExecuteTransactionParams } from "./send-transaction-with-paymaster";
import type { ChipiSDKConfig, TransactionResult, WalletData } from "./types";

export class ChipiSDK {
  private options: GaslessOptions;
  private rpcUrl: string;
  private argentClassHash: string;
  private contractAddress: string;
  private contractEntryPoint: string;

  constructor(config: ChipiSDKConfig) {
    this.options = {
      baseUrl: BASE_URL,
      apiKey: config.apiKey,
    };
    this.rpcUrl = config.rpcUrl;
    this.argentClassHash = config.argentClassHash;
    this.contractAddress = config.contractAddress;
    this.contractEntryPoint = config.contractEntryPoint || "set_greeting";
  }

  private formatAmount(amount: string | number, decimals: number = 18): Uint256 {
    const amountBN = typeof amount === 'string' ? 
      BigInt(amount) * BigInt(10 ** decimals) : 
      BigInt(amount) * BigInt(10 ** decimals);
    
    return cairo.uint256(amountBN);
  }

  async executeTransaction(input: ExecuteTransactionParams): Promise<string | null> {
    return executePaymasterTransaction({
      ...input,
      rpcUrl: this.rpcUrl,
      options: this.options,
    });
  }

  async transfer(params: {
    pin: string;
    wallet: WalletData;
    contractAddress: string;
    recipient: string;
    amount: string | number;
    decimals?: number;
  }): Promise<string | null> {
    return this.executeTransaction({
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [{
        contractAddress: params.contractAddress,
        entrypoint: 'transfer',
        calldata: [params.recipient, this.formatAmount(params.amount, params.decimals)]
      }]
    });
  }

  async approve(params: {
    pin: string;
    wallet: WalletData;
    contractAddress: string;
    spender: string;
    amount: string | number;
    decimals?: number;
  }): Promise<string | null> {
    return this.executeTransaction({
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [{
        contractAddress: params.contractAddress,
        entrypoint: 'approve',
        calldata: [params.spender, this.formatAmount(params.amount, params.decimals)]
      }]
    });
  }

  async stake(params: {
    pin: string;
    wallet: WalletData;
    contractAddress: string;
    amount: string | number;
    recipient: string;
    decimals?: number;
  }): Promise<string | null> {
    return this.executeTransaction({
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [{
        contractAddress: params.contractAddress,
        entrypoint: 'deposit',
        calldata: [this.formatAmount(params.amount, params.decimals), params.recipient]
      }]
    });
  }

  async withdraw(params: {
    pin: string;
    wallet: WalletData;
    contractAddress: string;
    amount: string | number;
    decimals?: number;
    recipient: string;
  }): Promise<string | null> {
    return this.executeTransaction({
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [{
        contractAddress: params.contractAddress,
        entrypoint: 'withdraw',
        calldata: [this.formatAmount(params.amount, params.decimals), params.recipient]
      }]
    });
  }

  async callAnyContract(params: {
    pin: string;
    wallet: WalletData;
    contractAddress: string;
    calls: Call[];
  }): Promise<string | null> {
    return this.executeTransaction({
      pin: params.pin,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: params.calls,
    });
  }
}


// Export types
export type {
  ChipiSDKConfig,
  WalletData,
  TransactionResult,
};
