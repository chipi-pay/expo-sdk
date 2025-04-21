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
import { CreateWalletResponse } from "./types";

export class ChipiSDK {
  private apiKey: string;
  private secretKey: string;
  private appId: string;

  constructor(config: ChipiSDKConfig) {
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.appId = config.appId;
  }


  private formatAmount(amount: string | number, decimals: number = 18): Uint256 {
    const amountStr = amount.toString();
    const [integerPart, decimalPart = ''] = amountStr.split('.');
    const paddedDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals);
    const amountBN = BigInt(integerPart + paddedDecimal);

    return cairo.uint256(amountBN);
  }

  async executeTransaction(input: ExecuteTransactionParams): Promise<string> {
    return executePaymasterTransaction({
      ...input,
    });
  }

  async transfer(params: TransferParams): Promise<string> {
    return this.executeTransaction({
      encryptKey: params.encryptKey,
      wallet: params.wallet,
      contractAddress: params.contractAddress,
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
    });
  }

  async createWallet(encryptKey: string): Promise<CreateWalletResponse> {
    return createArgentWallet({
      encryptKey: encryptKey,
      apiKey: this.apiKey,
      secretKey: this.secretKey,
      appId: this.appId,
      nodeUrl: "https://starknet-mainnet.public.blastapi.io/rpc/v0_7",
    });
  }
}

// Export types
// export type { ChipiSDKConfig, WalletData, TransactionResult };