import { useMutation } from '@tanstack/react-query';
import { createArgentWallet } from '../../core/create-wallet';
import { WalletData } from '../../core/types';

interface UseCreateWalletOptions {
  onSuccess?: (wallet: WalletData) => void;
  onError?: (error: Error) => void;
}

export function useCreateWallet(options?: UseCreateWalletOptions) {
  const mutation = useMutation({
    mutationFn: async (pin: string) => {
      const wallet = await createArgentWallet({
        pin,
        // ... other params from SDK context
        rpcUrl: "https://rpc.ankr.com/starknet",
        argentClassHash: "0x07a5267d00000000000000000000000000000000000000000000000000000000",
        contractAddress: "0x07a5267d00000000000000000000000000000000000000000000000000000000",
        contractEntryPoint: "get_counter",
        options: {
          baseUrl: "https://paymaster.avnu.fi",
          apiKey: "your_api_key",
          apiPublicKey: "your_api_public_key",
        }
      });

    return {
        publicKey: wallet.accountAddress, // assuming accountAddress can serve as publicKey
        encryptedPrivateKey: '', // you'll need to get this from somewhere
        accountAddress: wallet.accountAddress,
        txHash: wallet.txHash,
        success: wallet.success
      };
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

  return {
    createWallet: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
    wallet: mutation.data,
  };
}