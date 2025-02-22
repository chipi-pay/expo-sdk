import { ExecutePaymasterTransactionInput } from "./src/send-transaction-with-paymaster";
import type { ChipiSDKConfig, WalletData, TransactionResult } from "./src/types";
export declare class ChipiSDK {
    private options;
    private rpcUrl;
    private argentClassHash;
    private contractAddress;
    private contractEntryPoint;
    constructor(config: ChipiSDKConfig);
    createWallet(pin: string): Promise<TransactionResult>;
    executeTransaction(input: ExecutePaymasterTransactionInput): Promise<string | null>;
}
export type { ChipiSDKConfig, WalletData, TransactionResult, ExecutePaymasterTransactionInput };
