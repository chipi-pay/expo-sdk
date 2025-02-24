import { GaslessOptions } from '@avnu/gasless-sdk';
import { Call } from 'starknet';
import { C as ChipiSDKConfig, T as TransactionResult } from './index-D6nVG4M9.js';
export { b as ChipiProvider, f as ChipiProviderProps, a as CreateWalletResponse, W as WalletData, c as createArgentWallet, u as useChipiContext, d as useCreateWallet, e as useSign } from './index-D6nVG4M9.js';
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
    createWallet(encryptKey: string): Promise<TransactionResult>;
    executeTransaction(input: ExecutePaymasterTransactionInput): Promise<string | null>;
}

export { ChipiSDK, ChipiSDKConfig, TransactionResult, executePaymasterTransaction };
