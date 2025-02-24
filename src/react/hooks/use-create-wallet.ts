import { useMutation } from '@tanstack/react-query';
import { createArgentWallet, CreateWalletParams, CreateWalletResponse } from '../../core/create-wallet';
import { useChipiContext } from '../context';

interface UseCreateWalletOptions {
  onSuccess?: (createWalletResponse: CreateWalletResponse) => void;
  onError?: (error: Error) => void;
}


export function useCreateWallet(options?: UseCreateWalletOptions) {
  const { config } = useChipiContext();
  const mutation = useMutation<CreateWalletResponse, Error, Omit<CreateWalletParams, 'apiKey'>>({
    mutationFn: (params) => createArgentWallet({ 
      ...params,
      apiKey: config.apiKey 
    }),
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