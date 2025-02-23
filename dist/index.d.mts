import { GaslessOptions } from '@avnu/gasless-sdk';
import { Call } from 'starknet';
import { C as ChipiSDKConfig, T as TransactionResult } from './index-DiW3OmGT.mjs';
export { a as ChipiProvider, d as ChipiProviderProps, W as WalletData, u as useChipiContext, b as useCreateWallet, c as useSign } from './index-DiW3OmGT.mjs';
import 'react/jsx-runtime';
import '@tanstack/react-query';

interface ExecutePaymasterTransactionInput {
    pin: string;
    wallet: {
        publicKey: string;
        encryptedPrivateKey: string;
    };
    calls: Call[];
    rpcUrl?: string;
    options?: GaslessOptions;
}
declare const executePaymasterTransaction: (input: ExecutePaymasterTransactionInput) => Promise<string | null>;

declare class ChipiSDK {
    private options;
    private rpcUrl;
    private argentClassHash;
    private contractAddress;
    private contractEntryPoint;
    constructor(config: ChipiSDKConfig);
    createWallet(pin: string): Promise<TransactionResult>;
    executeTransaction(input: ExecutePaymasterTransactionInput): Promise<string | null>;
}

interface CreateWalletParams {
    pin: string;
    rpcUrl: string;
    options: GaslessOptions;
    argentClassHash: string;
    contractAddress: string;
    contractEntryPoint: string;
}
declare const createArgentWallet: (params: CreateWalletParams) => Promise<{
    success: boolean;
    accountAddress: string;
    txHash: string;
}>;

export { ChipiSDK, ChipiSDKConfig, TransactionResult, createArgentWallet, executePaymasterTransaction };
