import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { CallAnyContractParams } from "../../core";

export function useCallAnyContract() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation<
    string,
    Error,
    Omit<CallAnyContractParams, "apiPublicKey">
  >({
    mutationFn: chipiSDK.callAnyContract,
  });

  return {
    callAnyContract: mutation.mutate,
    callAnyContractAsync: mutation.mutateAsync,
    callAnyContractData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}
