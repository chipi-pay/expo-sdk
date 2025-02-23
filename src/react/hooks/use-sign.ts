// import { useMutation } from '@tanstack/react-query';
// import { executePaymasterTransaction } from '../../core/send-transaction-with-paymaster';
// import type { SignParams,WalletData } from '../../core/types';

// interface UseSignOptions {
//   wallet: WalletData;
//   onSuccess?: (txHash: string) => void;
//   onError?: (error: Error) => void;
// }

// export function useSign({ wallet, ...options }: UseSignOptions) {
//   const mutation = useMutation({
//     mutationFn: async (params: SignParams) => {
//       return executePaymasterTransaction({
//         ...params,
//         wallet,
//         // ... other params from SDK context
//       });
//     },
//     onSuccess: options?.onSuccess,
//     onError: options?.onError,
//   });

//   return {
//     sign: mutation.mutate,
//     isSigning: mutation.isPending,
//     error: mutation.error,
//     lastTxHash: mutation.data,
//   };
// }


export function useSign(){
  return {
    sign: () => {
      return "sign 3";
    }
  }
}