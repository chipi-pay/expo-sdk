import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { WithdrawParams } from "../../core";




export function useWithdraw() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation<string, Error, Omit<WithdrawParams, 'apiPublicKey'>>({
    mutationFn: chipiSDK.withdraw,
  });

  return {
    withdraw: mutation.mutate,
    withdrawAsync: mutation.mutateAsync,
    withdrawData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}