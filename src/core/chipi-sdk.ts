import { BASE_URL, GaslessOptions } from "@avnu/gasless-sdk";
import { createArgentWallet } from "./create-wallet";
import { ExecutePaymasterTransactionInput, executePaymasterTransaction } from "./send-transaction-with-paymaster";
import type { ChipiSDKConfig, TransactionResult } from "./types";

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
    this.contractEntryPoint = config.contractEntryPoint || "get_counter";
  }

  // async createWallet(encryptKey: string): Promise<TransactionResult> {
  //   return createArgentWallet({
  //     encryptKey,
  //   });
  // }

  async executeTransaction(input: ExecutePaymasterTransactionInput): Promise<string | null> {
    return executePaymasterTransaction({
      ...input,
      rpcUrl: this.rpcUrl,
      options: this.options,
    });
  }
}