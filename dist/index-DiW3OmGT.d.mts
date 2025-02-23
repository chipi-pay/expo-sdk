import * as react_jsx_runtime from 'react/jsx-runtime';
import * as _tanstack_react_query from '@tanstack/react-query';

interface ChipiSDKConfig {
    paymasterApiKey: string;
    rpcUrl: string;
    argentClassHash: string;
    contractAddress: string;
    contractEntryPoint?: string;
}
interface WalletData {
    publicKey: string;
    encryptedPrivateKey: string;
}
interface TransactionResult {
    success: boolean;
    txHash: string;
}

interface ChipiContextValue {
    config: ChipiSDKConfig;
}
declare function ChipiProvider({ children, config }: {
    children: React.ReactNode;
    config: ChipiSDKConfig;
}): react_jsx_runtime.JSX.Element;
declare function useChipiContext(): ChipiContextValue;

interface UseCreateWalletOptions {
    onSuccess?: (wallet: WalletData) => void;
    onError?: (error: Error) => void;
}
declare function useCreateWallet(options?: UseCreateWalletOptions): {
    createWallet: _tanstack_react_query.UseMutateFunction<{
        publicKey: string;
        encryptedPrivateKey: string;
        accountAddress: string;
        txHash: string;
        success: boolean;
    }, Error, string, unknown>;
    isCreating: boolean;
    error: Error | null;
    wallet: {
        publicKey: string;
        encryptedPrivateKey: string;
        accountAddress: string;
        txHash: string;
        success: boolean;
    } | undefined;
};

declare function useSign(): {
    sign: () => string;
};

interface ChipiProviderProps {
    children: React.ReactNode;
    config: ChipiSDKConfig;
}

export { type ChipiSDKConfig as C, type TransactionResult as T, type WalletData as W, ChipiProvider as a, useCreateWallet as b, useSign as c, type ChipiProviderProps as d, useChipiContext as u };
