import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { TransferParams } from "../../core";




export function useTransfer() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation({
    mutationFn: (params: TransferParams) => chipiSDK.transfer(params),
  });

  return {
    transfer: mutation.mutate,
    transferAsync: mutation.mutateAsync,
    transferData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}