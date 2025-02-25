import { BASE_URL, GaslessOptions } from "@avnu/gasless-sdk";
import { cairo, type Call, type Uint256 } from "starknet";
import {
  executePaymasterTransaction,
  ExecuteTransactionParams,
} from "./send-transaction-with-paymaster";
import type {
  ApproveParams,
  CallAnyContractParams,
  ChipiSDKConfig,
  CreateWalletParams,
  StakeParams,
  TransactionResult,
  TransferParams,
  WithdrawParams,
} from "./types";
import { createArgentWallet } from "./create-wallet";
import { CreateWalletResponse } from ".";

export class ChipiSDK {
  private options: GaslessOptions;
  private rpcUrl: string;
  private apiKey: string;
  private argentClassHash: string;
  private activateContractAddress: string;
  private activateContractEntryPoint: string;
  private network: "mainnet" | "sepolia";

  constructor(config: ChipiSDKConfig) {
    this.options = {
      baseUrl: BASE_URL,
      apiKey: config.apiKey,
    };
    this.apiKey = config.apiKey;
    this.network = config.network;
    this.rpcUrl = config.rpcUrl;
    this.argentClassHash =
      config.argentClassHash ||
      "0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f";
    this.activateContractAddress =
      config.activateContractAddress ||
      "0x0425fe282af8a0fce7478e06d21295fe85e57447f4f5127f80a04ef2eb6291fd";
    this.activateContractEntryPoint =
      config.activateContractEntryPoint || "set_greeting";
  }

  private formatAmount(amount: string | number, decimals: number = 18): Uint256 {
    const numericAmount = Number(amount);
    const multiplier = 10 ** decimals;
    
    const amountBN = BigInt(Math.round(numericAmount * multiplier));
    
    return cairo.uint256(amountBN);
  }

  async executeTransaction(input: ExecuteTransactionParams): Promise<string> {
    return executePaymasterTransaction({
      ...input,
      rpcUrl: this.rpcUrl,
      options: this.options,
    });
  }

  async transfer(params: TransferParams): Promise<string> {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [
        {
          contractAddress: params.contractAddress,
          entrypoint: "transfer",
          calldata: [
            params.recipient,
            this.formatAmount(params.amount, params.decimals),
          ],
        },
      ],
    });
  }

  async approve(params: ApproveParams): Promise<string> {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [
        {
          contractAddress: params.contractAddress,
          entrypoint: "approve",
          calldata: [
            params.spender,
            this.formatAmount(params.amount, params.decimals),
          ],
        },
      ],
    });
  }

  async stake(params: StakeParams): Promise<string> {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [
        {
          contractAddress: params.contractAddress,
          entrypoint: "deposit",
          calldata: [
            this.formatAmount(params.amount, params.decimals),
            params.recipient,
          ],
        },
      ],
    });
  }

  async withdraw(params: WithdrawParams): Promise<string> {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      rpcUrl: this.rpcUrl,
      options: this.options,
      calls: [
        {
          contractAddress: params.contractAddress,
          entrypoint: "withdraw",
          calldata: [
            this.formatAmount(params.amount, params.decimals),
            params.recipient,
          ],
        },
      ],
    });
  }

  async callAnyContract(params: CallAnyContractParams): Promise<string> {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
      calls: params.calls,
      rpcUrl: this.rpcUrl,
      options: this.options,
    });
  }

  async createWallet(encryptKey: string): Promise<CreateWalletResponse> {
    return createArgentWallet({
      encryptKey: encryptKey,
      rpcUrl: this.rpcUrl,
      argentClassHash: this.argentClassHash,
      activateContractAddress: this.activateContractAddress,
      activateContractEntryPoint: this.activateContractEntryPoint,
      apiKey: this.apiKey,
      network: this.network,
    });
  }
}

// Export types
// export type { ChipiSDKConfig, WalletData, TransactionResult };
