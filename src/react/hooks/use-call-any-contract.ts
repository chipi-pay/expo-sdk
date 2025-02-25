import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { CallAnyContractParams } from "../../core";


export function useCallAnyContract() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation({
    mutationFn: (params: CallAnyContractParams) => chipiSDK.callAnyContract(params),
  });

  return {
    callAnyContract: mutation.mutate,
    callAnyContractAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}