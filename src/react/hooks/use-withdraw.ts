import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { WithdrawParams } from "../../core";




export function useWithdraw() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation({
    mutationFn: (params: WithdrawParams) => chipiSDK.withdraw(params),
  });

  return {
    withdraw: mutation.mutate,
    withdrawAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}