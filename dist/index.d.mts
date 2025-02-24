import { GaslessOptions } from '@avnu/gasless-sdk';
import { Call } from 'starknet';
import { C as ChipiSDKConfig } from './index-DXhemuAU.mjs';
export { b as ChipiProvider, f as ChipiProviderProps, a as CreateWalletResponse, T as TransactionResult, W as WalletData, c as createArgentWallet, u as useChipiContext, d as useCreateWallet, e as useSign } from './index-DXhemuAU.mjs';
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
    executeTransaction(input: ExecutePaymasterTransactionInput): Promise<string | null>;
}

export { ChipiSDK, ChipiSDKConfig, executePaymasterTransaction };
