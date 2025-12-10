export const extractBlobUrls = (
  data: Record<string, any>,
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv', '.webm', '.mp3', '.wav', '.aac', '.ogg', '.m4a', '.pdf']
): Record<string, string> => {
  const result: Record<string, string> = {};

  const isValidBlobUrl = (value: any): boolean => {
    return (
      typeof value === 'string' &&
      allowedExtensions.some(ext => value.toLowerCase().includes(ext))
    );
  };

  const traverse = (obj: any, parentKey = '') => {
    if (!obj || typeof obj !== 'object') return;

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (isValidBlobUrl(item)) {
            result[`${parentKey || key}${index}`] = item;
          } else if (typeof item === 'object') {
            traverse(item, `${parentKey || key}${index}`);
          }
        });
      } else if (typeof value === 'object') {
        traverse(value, key);
      } else if (isValidBlobUrl(value)) {
        result[parentKey ? `${parentKey}_${key}` : key] = value;
      }
    }
  };

  traverse(data);
  return result;
};

export const extractResourceUrls = (
  azureData: Record<string, any>
): Record<string, string | undefined> => {
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(azureData)) {
    if (value && typeof value === 'object' && value.resourceUrl) {
      result[key] = value.resourceUrl;
    }
  }

  return result;
};