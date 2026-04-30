import { useQuery } from "@tanstack/react-query";
import {
  CurationFetchLoaderAPI,
  createEmptyHomeCurations,
} from "../../../api/curationFetchLoader";

export function useHomeCurations() {
  return useQuery({
    ...CurationFetchLoaderAPI.getHomeCurations(),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData ?? createEmptyHomeCurations(),
  });
}
