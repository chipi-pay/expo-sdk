import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { ApproveParams } from "../../core";

export function useApprove() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation<
    string,
    Error,
    Omit<ApproveParams, "apiPublicKey">
  >({
    mutationFn: chipiSDK.approve,
  });

  return {
    approve: mutation.mutate,
    approveAsync: mutation.mutateAsync,
    approveData: mutation.data,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}
