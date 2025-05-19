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
  private apiPublicKey: string;
  private readonly nodeUrl = "https://starknet-mainnet.public.blastapi.io/rpc/v0_7";

  constructor(config: ChipiSDKConfig) {
    this.apiPublicKey = config.apiPublicKey;
  }

  private formatAmount(amount: string | number, decimals: number = 18): Uint256 {
    const amountStr = amount.toString();
    const [integerPart, decimalPart = ''] = amountStr.split('.');
    const paddedDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals);
    const amountBN = BigInt(integerPart + paddedDecimal);

    return cairo.uint256(amountBN);
  }

  async executeTransaction(input: Omit<ExecuteTransactionParams, 'apiPublicKey'>): Promise<string> {
    return executePaymasterTransaction({
      ...input,
      apiPublicKey: this.apiPublicKey,
    });
  }

  async transfer(params: Omit<TransferParams, 'apiPublicKey'>): Promise<string> {
    const { encryptKey, wallet, contractAddress, recipient, amount, decimals, bearerToken } = params;
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls: [
        {
          contractAddress,
          entrypoint: "transfer",
          calldata: [
            recipient,
            this.formatAmount(amount, decimals),
          ],
        },
      ],
    });
  }

  async approve(params: Omit<ApproveParams, 'apiPublicKey'>): Promise<string> {
    const { encryptKey, wallet, contractAddress, spender, amount, decimals, bearerToken } = params;
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls: [
        {
          contractAddress,
          entrypoint: "approve",
          calldata: [
            spender,
            this.formatAmount(amount, decimals),
          ],
        },
      ],
    });
  }

  async stake(params: Omit<StakeParams, 'apiPublicKey'>): Promise<string> {
    const { encryptKey, wallet, contractAddress, amount, recipient, decimals, bearerToken } = params;
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls: [
        {
          contractAddress,
          entrypoint: "deposit",
          calldata: [
            this.formatAmount(amount, decimals),
            recipient,
          ],
        },
      ],
    });
  }

  async withdraw(params: Omit<WithdrawParams, 'apiPublicKey'>): Promise<string> {
    const { encryptKey, wallet, contractAddress, amount, recipient, decimals, bearerToken } = params;
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls: [
        {
          contractAddress,
          entrypoint: "withdraw",
          calldata: [
            this.formatAmount(amount, decimals),
            recipient,
          ],
        },
      ],
    });
  }

  async callAnyContract(params: Omit<CallAnyContractParams, 'apiPublicKey'>): Promise<string> {
    const { encryptKey, wallet, contractAddress, calls, bearerToken } = params;
    return this.executeTransaction({
      encryptKey,
      wallet,
      bearerToken,
      calls,
    });
  }

  async createWallet(params: Omit<CreateWalletParams, 'apiPublicKey'>): Promise<CreateWalletResponse> {
    const { encryptKey, bearerToken, nodeUrl } = params;
    return createArgentWallet({
      encryptKey: encryptKey,
      apiPublicKey: this.apiPublicKey,
      bearerToken,
      nodeUrl,
    });
  }
}

// Export types
// export type { ChipiSDKConfig, WalletData, TransactionResult };