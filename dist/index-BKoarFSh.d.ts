import * as react_jsx_runtime from 'react/jsx-runtime';
import { Call } from 'starknet';
import * as _tanstack_react_query from '@tanstack/react-query';

interface ExecuteTransactionParams$1 {
    apiPublicKey: string;
    encryptKey: string;
    bearerToken: string;
    wallet: {
        publicKey: string;
        encryptedPrivateKey: string;
    };
    calls: Call[];
}
declare const executePaymasterTransaction: (params: ExecuteTransactionParams$1) => Promise<string>;

interface ChipiSDKConfig$1 {
    apiPublicKey: string;
}
interface WalletData {
    publicKey: string;
    encryptedPrivateKey: string;
}
interface TransferParams {
    encryptKey: string;
    wallet: WalletData;
    contractAddress: string;
    recipient: string;
    amount: string | number;
    decimals?: number;
    bearerToken: string;
}
interface ApproveParams {
    encryptKey: string;
    wallet: WalletData;
    contractAddress: string;
    spender: string;
    amount: string | number;
    decimals?: number;
    bearerToken: string;
}
interface StakeParams {
    encryptKey: string;
    wallet: WalletData;
    amount: string | number;
    receiverWallet: string;
    bearerToken: string;
}
interface WithdrawParams {
    encryptKey: string;
    wallet: WalletData;
    recipient: string;
    contractAddress: string;
    amount: string | number;
    decimals?: number;
    bearerToken: string;
}
interface CallAnyContractParams {
    encryptKey: string;
    wallet: WalletData;
    contractAddress: string;
    calls: Call[];
    bearerToken: string;
}
interface ExecuteTransactionParams {
    encryptKey: string;
    wallet: WalletData;
    contractAddress: string;
    calls: Call[];
    bearerToken: string;
}
interface CreateWalletParams {
    encryptKey: string;
    apiPublicKey: string;
    bearerToken: string;
    nodeUrl: string;
}
interface CreateWalletResponse {
    success: boolean;
    wallet: WalletData;
    txHash: string;
}
interface IncrementParams {
}
type TransactionParams = {
    type: "transfer" | "approve";
    params: TransferParams;
} | {
    type: "wildcard";
    params: IncrementParams;
};
interface SimpleTransactionInput {
    pin: string;
    wallet: WalletData;
    contractAddress: string;
    calls: Call[];
}
interface TransactionInput {
    pin: string;
    wallet: WalletData;
    calls: Call[];
}
interface TransactionResult {
    success: boolean;
    accountAddress: string;
    encryptedPrivateKey: string;
    txHash: string;
}

declare class ChipiSDK {
    private apiPublicKey;
    private readonly nodeUrl;
    constructor(config: ChipiSDKConfig$1);
    private formatAmount;
    executeTransaction(input: Omit<ExecuteTransactionParams$1, 'apiPublicKey'>): Promise<string>;
    transfer(params: Omit<TransferParams, 'apiPublicKey'>): Promise<string>;
    approve(params: Omit<ApproveParams, 'apiPublicKey'>): Promise<string>;
    stakeVesuUsdc(params: Omit<StakeParams, 'apiPublicKey'>): Promise<string>;
    withdraw(params: Omit<WithdrawParams, 'apiPublicKey'>): Promise<string>;
    callAnyContract(params: Omit<CallAnyContractParams, 'apiPublicKey'>): Promise<string>;
    createWallet(params: Omit<CreateWalletParams, 'apiPublicKey' | 'nodeUrl'>): Promise<CreateWalletResponse>;
}

interface ChipiSDKConfig {
    apiPublicKey: string;
}
interface ChipiContextValue {
    config: ChipiSDKConfig;
    chipiSDK: ChipiSDK;
}
declare function ChipiProvider({ children, config, }: {
    children: React.ReactNode;
    config: ChipiSDKConfig;
}): react_jsx_runtime.JSX.Element;
declare function useChipiContext(): ChipiContextValue;

declare function useCreateWallet(): {
    createWallet: _tanstack_react_query.UseMutateFunction<CreateWalletResponse, Error, Omit<CreateWalletParams, "apiPublicKey" | "nodeUrl">, unknown>;
    createWalletAsync: _tanstack_react_query.UseMutateAsyncFunction<CreateWalletResponse, Error, Omit<CreateWalletParams, "apiPublicKey" | "nodeUrl">, unknown>;
    createWalletResponse: CreateWalletResponse | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useTransfer(): {
    transfer: _tanstack_react_query.UseMutateFunction<string, Error, Omit<TransferParams, "apiPublicKey">, unknown>;
    transferAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, Omit<TransferParams, "apiPublicKey">, unknown>;
    transferData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useApprove(): {
    approve: _tanstack_react_query.UseMutateFunction<string, Error, Omit<ApproveParams, "apiPublicKey">, unknown>;
    approveAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, Omit<ApproveParams, "apiPublicKey">, unknown>;
    approveData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useStakeVesuUsdc(): {
    stake: _tanstack_react_query.UseMutateFunction<string, Error, Omit<StakeParams, "apiPublicKey">, unknown>;
    stakeAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, Omit<StakeParams, "apiPublicKey">, unknown>;
    stakeData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useWithdraw(): {
    withdraw: _tanstack_react_query.UseMutateFunction<string, Error, Omit<WithdrawParams, "apiPublicKey">, unknown>;
    withdrawAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, Omit<WithdrawParams, "apiPublicKey">, unknown>;
    withdrawData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useCallAnyContract(): {
    callAnyContract: _tanstack_react_query.UseMutateFunction<string, Error, Omit<CallAnyContractParams, "apiPublicKey">, unknown>;
    callAnyContractAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, Omit<CallAnyContractParams, "apiPublicKey">, unknown>;
    callAnyContractData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

interface ChipiProviderProps {
    children: React.ReactNode;
    config: ChipiSDKConfig$1;
}

export { type ApproveParams as A, type CreateWalletParams as C, type ExecuteTransactionParams as E, type IncrementParams as I, type StakeParams as S, type TransferParams as T, type WalletData as W, type CreateWalletResponse as a, ChipiSDK as b, type ChipiSDKConfig$1 as c, type WithdrawParams as d, executePaymasterTransaction as e, type CallAnyContractParams as f, type TransactionParams as g, type SimpleTransactionInput as h, type TransactionInput as i, type TransactionResult as j, ChipiProvider as k, type ChipiProviderProps as l, useCreateWallet as m, useTransfer as n, useApprove as o, useStakeVesuUsdc as p, useWithdraw as q, useCallAnyContract as r, useChipiContext as u };
