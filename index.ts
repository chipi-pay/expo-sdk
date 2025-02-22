import { GaslessOptions } from "@avnu/gasless-sdk";
import { Call } from "starknet";
import { createArgentWallet } from "./src/create-wallet";
import { ExecutePaymasterTransactionInput, executePaymasterTransaction } from "./src/send-transaction-with-paymaster";
import type { ChipiSDKConfig, WalletData, TransactionResult } from "./src/types";

export class ChipiSDK {
  private options: GaslessOptions;
  private rpcUrl: string;
  private argentClassHash: string;
  private contractAddress: string;
  private contractEntryPoint: string;

  constructor(config: ChipiSDKConfig) {
    this.options = {
      baseUrl: "https://paymaster.avnu.fi",
      apiKey: config.paymasterApiKey,
    };
    this.rpcUrl = config.rpcUrl;
    this.argentClassHash = config.argentClassHash;
    this.contractAddress = config.contractAddress;
    this.contractEntryPoint = config.contractEntryPoint || "get_counter";
  }

  async createWallet(pin: string): Promise<TransactionResult> {
    return createArgentWallet({
      pin,
      rpcUrl: this.rpcUrl,
      options: this.options,
      argentClassHash: this.argentClassHash,
      contractAddress: this.contractAddress,
      contractEntryPoint: this.contractEntryPoint,
    });
  }

  async executeTransaction(input: ExecutePaymasterTransactionInput): Promise<string | null> {
    return executePaymasterTransaction({
      ...input,
      rpcUrl: this.rpcUrl,
      options: this.options,
    });
  }
}

// Export types
export type {
  ChipiSDKConfig,
  WalletData,
  TransactionResult,
  ExecutePaymasterTransactionInput
};
