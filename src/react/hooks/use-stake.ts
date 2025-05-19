import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { StakeParams } from "../../core";




export function useStake() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation<string, Error, Omit<StakeParams, 'apiPublicKey'>>({
    mutationFn: chipiSDK.stake,
  });

  return {
    stake: mutation.mutate,
    stakeAsync: mutation.mutateAsync,
    stakeData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}