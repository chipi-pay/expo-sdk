import * as react_jsx_runtime from 'react/jsx-runtime';
import { GaslessOptions } from '@avnu/gasless-sdk';
import { Call } from 'starknet';
import * as _tanstack_react_query from '@tanstack/react-query';

interface ExecuteTransactionParams {
    encryptKey: string;
    wallet: {
        publicKey: string;
        encryptedPrivateKey: string;
    };
    contractAddress: string;
    calls: Call[];
    rpcUrl: string;
    options: GaslessOptions;
}
declare const executePaymasterTransaction: (params: ExecuteTransactionParams) => Promise<string>;

interface ChipiSDKConfig$1 {
    apiKey: string;
    rpcUrl: string;
    argentClassHash?: string;
    activateContractAddress?: string;
    activateContractEntryPoint?: string;
    network: "mainnet" | "sepolia";
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
}
interface ApproveParams {
    encryptKey: string;
    wallet: WalletData;
    contractAddress: string;
    spender: string;
    amount: string | number;
    decimals?: number;
}
interface StakeParams {
    encryptKey: string;
    wallet: WalletData;
    contractAddress: string;
    amount: string | number;
    recipient: string;
    decimals?: number;
}
interface WithdrawParams {
    encryptKey: string;
    wallet: WalletData;
    recipient: string;
    contractAddress: string;
    amount: string | number;
    decimals?: number;
}
interface CallAnyContractParams {
    encryptKey: string;
    wallet: WalletData;
    contractAddress: string;
    calls: Call[];
}
interface CreateWalletParams {
    encryptKey: string;
    apiKey: string;
    network: "mainnet" | "sepolia";
    rpcUrl: string;
    argentClassHash: string;
    activateContractAddress: string;
    activateContractEntryPoint: string;
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
    private options;
    private rpcUrl;
    private apiKey;
    private argentClassHash;
    private activateContractAddress;
    private activateContractEntryPoint;
    private network;
    constructor(config: ChipiSDKConfig$1);
    private formatAmount;
    executeTransaction(input: ExecuteTransactionParams): Promise<string>;
    transfer(params: TransferParams): Promise<string>;
    approve(params: ApproveParams): Promise<string>;
    stake(params: StakeParams): Promise<string>;
    withdraw(params: WithdrawParams): Promise<string>;
    callAnyContract(params: CallAnyContractParams): Promise<string>;
    createWallet(encryptKey: string): Promise<CreateWalletResponse>;
}

interface ChipiSDKConfig {
    apiKey: string;
    rpcUrl: string;
    network: "mainnet" | "sepolia";
    activateContractAddress?: string;
    argentClassHash?: string;
    activateContractEntryPoint?: string;
}
interface ChipiContextValue {
    config: ChipiSDKConfig;
    chipiSDK: ChipiSDK;
}
declare function ChipiProvider({ children, config }: {
    children: React.ReactNode;
    config: ChipiSDKConfig;
}): react_jsx_runtime.JSX.Element;
declare function useChipiContext(): ChipiContextValue;

declare function useCreateWallet(): {
    createWallet: _tanstack_react_query.UseMutateFunction<CreateWalletResponse, Error, string, unknown>;
    createWalletAsync: _tanstack_react_query.UseMutateAsyncFunction<CreateWalletResponse, Error, string, unknown>;
    createWalletResponse: CreateWalletResponse | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useTransfer(): {
    transfer: _tanstack_react_query.UseMutateFunction<string, Error, TransferParams, unknown>;
    transferAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, TransferParams, unknown>;
    transferData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useApprove(): {
    approve: _tanstack_react_query.UseMutateFunction<string, Error, ApproveParams, unknown>;
    approveAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, ApproveParams, unknown>;
    approveData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useStake(): {
    stake: _tanstack_react_query.UseMutateFunction<string, Error, StakeParams, unknown>;
    stakeAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, StakeParams, unknown>;
    stakeData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useWithdraw(): {
    withdraw: _tanstack_react_query.UseMutateFunction<string, Error, WithdrawParams, unknown>;
    withdrawAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, WithdrawParams, unknown>;
    withdrawData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

declare function useCallAnyContract(): {
    callAnyContract: _tanstack_react_query.UseMutateFunction<string, Error, CallAnyContractParams, unknown>;
    callAnyContractAsync: _tanstack_react_query.UseMutateAsyncFunction<string, Error, CallAnyContractParams, unknown>;
    callAnyContractData: string | undefined;
    isLoading: boolean;
    isError: boolean;
};

interface ChipiProviderProps {
    children: React.ReactNode;
    config: ChipiSDKConfig$1;
}

export { type ApproveParams as A, type CreateWalletParams as C, type IncrementParams as I, type StakeParams as S, type TransferParams as T, type WalletData as W, type CreateWalletResponse as a, ChipiSDK as b, type ChipiSDKConfig$1 as c, type WithdrawParams as d, executePaymasterTransaction as e, type CallAnyContractParams as f, type TransactionParams as g, type SimpleTransactionInput as h, type TransactionInput as i, type TransactionResult as j, ChipiProvider as k, type ChipiProviderProps as l, useCreateWallet as m, useTransfer as n, useApprove as o, useStake as p, useWithdraw as q, useCallAnyContract as r, useChipiContext as u };
