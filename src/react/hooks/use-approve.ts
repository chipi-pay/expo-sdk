

import { useMutation } from "@tanstack/react-query";
import { useChipiContext } from "../context";
import { ApproveParams } from "../../core";




export function useApprove() {
  const { chipiSDK } = useChipiContext();

  const mutation = useMutation({
    mutationFn: (params: ApproveParams) => chipiSDK.approve(params),
  });

  return {
    approve: mutation.mutate,
    approveAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}
