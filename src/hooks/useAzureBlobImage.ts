import { useEffect, useState } from 'react';
import { useGetAzureBlobMutation } from '../data/redux/services/sectionsApi';

interface UseAzureBlobImageReturn {
  resourceUrl: string | null;
  base64Image: string | null;
  isLoading: boolean;
}

export const useAzureBlobImages = (
  blobUrls: Record<string, string | undefined>
): Record<string, UseAzureBlobImageReturn> => {
  const [getAzureBlobRequest, { isLoading }] = useGetAzureBlobMutation();
  const [imageData, setImageData] = useState<Record<string, UseAzureBlobImageReturn>>({});

  useEffect(() => {
    const fetchImageData = async () => {
      const newData: Record<string, UseAzureBlobImageReturn> = {};

      // Iterate over each blob URL and fetch image data
      for (const [key, blobUrl] of Object.entries(blobUrls)) {
        if (!blobUrl) continue;

        const encodedUrl = encodeURIComponent(blobUrl);
        const azureApiUrl = `https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=${encodedUrl}`;
        
        console.log('useAzureBlobImages - Original blob URL:', blobUrl);
        console.log('useAzureBlobImages - Encoded URL:', encodedUrl);
        console.log('useAzureBlobImages - Azure API URL:', azureApiUrl);

        // Update initial data with the image URL and loading state
        if (!imageData[key]) {
          newData[key] = {
            resourceUrl: azureApiUrl,
            base64Image: null,
            isLoading, // Maintain loading state
          };
        }

        // Fetch base64 data asynchronously
        // try {
        //   const res = await getAzureBlobRequest(encodedUrl).unwrap();
        //   if (res?.data) {
        //     newData[key].base64Image = res.data;
        //   }
        // } catch (error) {
        //   console.error("Error fetching base64 image data", error);
        // }
      }

      // Only update state if new data has been fetched
      setImageData((prevData) => {
        const hasChanges = Object.keys(newData).some(
          (key) => JSON.stringify(newData[key]) !== JSON.stringify(prevData[key])
        );
        return hasChanges ? newData : prevData;
      });
    };

    // Only fetch data if `blobUrls` has changed
    if (Object.keys(blobUrls).length > 0) {
      fetchImageData();
    }
  }, [blobUrls, isLoading, getAzureBlobRequest]); // Dependencies: fetch new data when `blobUrls` or `isLoading` changes

  return imageData;
};
