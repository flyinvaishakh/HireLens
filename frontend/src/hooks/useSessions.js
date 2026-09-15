import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionApi } from "../api/sessions";

export const useCreateSession = () => {
  const result = useMutation({
    mutationKey: ["createSession"],
    mutationFn: sessionApi.createSession,
    onSuccess: () => toast.success("Session created successfully!"),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to create room"),
  });

  return result;
};

export const useActiveSessions = () => {
  const result = useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
  });

  return result;
};

export const useMyRecentSessions = () => {
  const result = useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });

  return result;
};

//This hook fetches data from backend, caches it, auto-refetches every 5 seconds, Returns loading/data/error state
//Ensures that we always have fresh session Info
export const useSessionById = (id) => {
  const result = useQuery({
    queryKey: ["session", id], //This is the cache key, if another component asks for the same key, then cached data is reused
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id, //Runs query only if id exists, if id is undefined it prevents calling
    refetchInterval: 5000, // refetch every 5 seconds to detect session status changes
  });

  return result;
};

export const useJoinSession = () => {
  const result = useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
    onSuccess: () => toast.success("Joined session successfully!"),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to join session"),
  });

  return result;
};

export const useLeaveSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["leaveSession"],
    mutationFn: sessionApi.leaveSession,

    onSuccess: () => {
      toast.success("Left session successfully!");

      queryClient.invalidateQueries({
        queryKey: ["activeSessions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to leave session");
    },
  });
};

export const useEndSession = () => {
  const result = useMutation({
    mutationKey: ["endSession"],
    mutationFn: sessionApi.endSession,
    onSuccess: () => toast.success("Session ended successfully!"),
    onError: (error) =>
      toast.error(error.response?.data?.message || "Failed to end session"),
  });

  return result;
};
