import { GaslessOptions } from "@avnu/gasless-sdk";
import { Call } from "starknet";
import { createArgentWallet } from "./src/create-wallet";
import { ExecutePaymasterTransactionInput, executePaymasterTransaction } from "./src/send-transaction-with-paymaster";

export class ChipiSDK {
  private options: GaslessOptions;
  private rpcUrl: string;
  private argentClassHash: string;
  private contractAddress: string;
  private contractEntryPoint: string;

  constructor(config: {
    paymasterApiKey: string;
    rpcUrl: string;
    argentClassHash: string;
    contractAddress: string;
    contractEntryPoint?: string;
  }) {
    this.options = {
      baseUrl: "https://paymaster.avnu.fi",
      apiKey: config.paymasterApiKey,
    };
    this.rpcUrl = config.rpcUrl;
    this.argentClassHash = config.argentClassHash;
    this.contractAddress = config.contractAddress;
    this.contractEntryPoint = config.contractEntryPoint || "get_counter";
  }

  async createWallet(pin: string) {
    return createArgentWallet({
      pin,
      rpcUrl: this.rpcUrl,
      options: this.options,
      argentClassHash: this.argentClassHash,
      contractAddress: this.contractAddress,
      contractEntryPoint: this.contractEntryPoint,
    });
  }

  async executeTransaction(input: ExecutePaymasterTransactionInput) {
    return executePaymasterTransaction({
      ...input,
      rpcUrl: this.rpcUrl,
      options: this.options,
    });
  }
}

export type { ExecutePaymasterTransactionInput };
