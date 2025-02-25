import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import {  CreateWalletResponse } from "../../core";


export function useCreateWallet() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation<CreateWalletResponse, Error, string>({
    mutationFn: (encryptKey: string) => chipiSDK.createWallet(encryptKey),
  });

  return {
    createWallet: mutation.mutate,
    createWalletAsync: mutation.mutateAsync,
    createWalletResponse: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}