import { useMutation } from '@tanstack/react-query';
import { createArgentWallet, CreateWalletParams, CreateWalletResponse } from '../../core/create-wallet';

interface UseCreateWalletOptions {
  onSuccess?: (createWalletResponse: CreateWalletResponse) => void;
  onError?: (error: Error) => void;
}


export function useCreateWallet(options?: UseCreateWalletOptions) {
  const mutation = useMutation<CreateWalletResponse, Error, CreateWalletParams>({
    mutationFn: createArgentWallet,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

  return {
    createWallet: mutation.mutate,
    createWalletAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    wallet: mutation.data,
  };
}