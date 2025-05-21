import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import {  CreateWalletParams, CreateWalletResponse } from "../../core";


export function useCreateWallet() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation<CreateWalletResponse, Error, Omit<CreateWalletParams, 'apiPublicKey' | 'nodeUrl'>>({
    mutationFn: chipiSDK.createWallet,
  });

  return {
    createWallet: mutation.mutate,
    createWalletAsync: mutation.mutateAsync,
    createWalletResponse: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}