import { useQuery } from "@tanstack/react-query";
import { problemApi } from "../api/problems";

export const useProblems = () => {
  return useQuery({
    queryKey: ["problems"],
    queryFn: problemApi.getAllProblems,
  });
};

export const useProblem = (slug) => {
  return useQuery({
    queryKey: ["problem", slug],
    queryFn: () => problemApi.getProblemBySlug(slug),
    enabled: !!slug,
  });
};
