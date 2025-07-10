import { getAccessControlDetails } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export function useAccessControl() {
  return useQuery({
    queryKey: ["user", "appRole", "orgRole", "orgId"],
    queryFn: getAccessControlDetails,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
