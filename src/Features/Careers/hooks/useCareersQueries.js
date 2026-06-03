import { useMutation, useQuery } from "@tanstack/react-query";
import { careersApi } from "../api/careersApi";
import { getFallbackCareerForm } from "../data/careerApplicationData";

export const careersKeys = {
  openings: ["careers", "openings"],
  form: (jobId) => ["careers", "application-form", jobId || "general"],
};

export const useCareerOpenings = () => useQuery({
  queryKey: careersKeys.openings,
  queryFn: careersApi.getOpenings,
  placeholderData: { roles: [], unavailable: false },
  retry: false,
  staleTime: 60_000,
});

export const useCareerForm = (jobId) => useQuery({
  queryKey: careersKeys.form(jobId),
  queryFn: () => careersApi.getForm(jobId),
  placeholderData: getFallbackCareerForm(jobId),
  retry: false,
  staleTime: 60_000,
});

export const useSubmitCareerApplication = () => useMutation({
  mutationFn: careersApi.submitApplication,
});
