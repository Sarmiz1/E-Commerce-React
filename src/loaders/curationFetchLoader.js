import { CurationFetchLoaderAPI } from "../api/curationFetchLoader";
import { queryClient } from "../queries/queryClient";

export const curationFetchLoader = async () => {
  await queryClient.ensureQueryData(CurationFetchLoaderAPI.getHomeCurations());
  return null;
};
