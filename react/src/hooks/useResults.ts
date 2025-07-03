import { useQuery } from "@tanstack/react-query";
import { fetchResults } from "../api/resultsApi";

export const useResults = () => {
  return useQuery({
    queryKey: ["results"],
    queryFn: fetchResults,
    refetchOnWindowFocus: false,
  });
};