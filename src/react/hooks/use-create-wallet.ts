import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { CreateWalletResponse } from "../../core";

export function useCreateWallet() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation<CreateWalletResponse, Error, string>({
    mutationFn: async (encryptKey: string) => {
      const response = await chipiSDK.createWallet(encryptKey);
      
      // Asegurarnos de que la respuesta tenga la estructura correcta
      if (!response || !response.wallet) {
        throw new Error("Invalid response from SDK");
      }

      return {
        success: response.success,
        txHash: response.txHash,
        wallet: {
          publicKey: typeof response.wallet === 'string' ? response.wallet : response.wallet.publicKey,
          encryptedPrivateKey: response.wallet.encryptedPrivateKey
        }
      };
    },
  });

  return {
    createWallet: mutation.mutate,
    createWalletAsync: mutation.mutateAsync,
    createWalletResponse: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}