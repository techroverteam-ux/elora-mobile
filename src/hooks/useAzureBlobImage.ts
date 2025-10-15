import { useEffect, useState } from 'react';
import { useGetAzureBlobMutation } from '../data/redux/services/sectionsApi';

/**
 * Custom hook for resolving Azure Blob images.
 * Supports either generating a direct API URL or fetching Base64 data.
 */
export const useAzureBlobImage = (blobUrl?: string) => {
  const [getAzureBlobRequest, { isLoading }] = useGetAzureBlobMutation();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  useEffect(() => {
    if (!blobUrl) return;

    // --- Option 1: Generate a reusable API URL directly (fastest & simplest)
    const encodedUrl = encodeURIComponent(blobUrl);
    const azureApiUrl = `https://gbs-api.thankfulflower-dcee2acb.centralindia.azurecontainerapps.io/api/azure-blob/file?blobUrl=${encodedUrl}`;
    setImageUrl(azureApiUrl);

    // --- Option 2: (Optional) Fetch as Base64, if needed elsewhere
    // Uncomment if you want to prefetch the base64 data.
    /*
    getAzureBlobRequest(encodedUrl)
      .unwrap()
      .then((res) => {
        if (res?.data) {
          setBase64Image(res.data);
        }
      })
      .catch(() => {});
    */
  }, [blobUrl]);

  return {
    imageUrl,      // ready-to-use API URL
    base64Image,   // optional base64 data
    isLoading,
  };
};
