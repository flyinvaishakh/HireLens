import axiosInstance from "../lib/axios";

export const problemApi = {
  getAllProblems: async () => {
    const response = await axiosInstance.get("/api/problems");
    return response.data;
  },

  getProblemBySlug: async (slug) => {
    const response = await axiosInstance.get(`/api/problems/${slug}`);
    return response.data;
  },
};
