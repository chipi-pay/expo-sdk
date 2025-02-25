import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { StakeParams } from "../../core";




export function useStake() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation({
    mutationFn: (params: StakeParams) => chipiSDK.stake(params),
  });

  return {
    stake: mutation.mutate,
    stakeAsync: mutation.mutateAsync,
    stakeData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}