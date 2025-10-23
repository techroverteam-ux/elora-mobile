import { extractBlobUrls, extractResourceUrls } from '../utils/extractAzureUrls';
import { useAzureBlobImages } from './useAzureBlobImage';

export interface ResourceUrls {
  thumbnailImage?: string;
  streamingUrl?: string;
  downloadUrl?: string;
  headerImage?: string;
  mainImage?: string;
  video?: string;
  collegeFrame0?: string;
  collegeFrame1?: string;
  collegeFrame2?: string;
  collegeFrame3?: string;
  collegeFrame4?: string;
  collegeFrame5?: string;
  collegeFrame6?: string;
  collegeFrame7?: string;
}

export const useAzureAssets = (apiData: Record<string, any>) => {
  const blobUrls = extractBlobUrls(apiData);
  const azureData = useAzureBlobImages(blobUrls);
  const resourceUrls: ResourceUrls = extractResourceUrls(azureData);

  // console.log("blobUrls: ", blobUrls);
  // console.log("azureData: ", azureData);
  console.log("resourceUrls: ", resourceUrls);

  return { azureData, resourceUrls };
};
