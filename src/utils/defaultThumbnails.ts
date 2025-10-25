// Default thumbnails for audio content
export const getDefaultAudioThumbnail = (title: string): string => {
  // Generate a simple gradient thumbnail based on title
  const colors = [
    'FF6B6B', 'FFE66D', '4ECDC4', '45B7D1', 
    'A8E6CF', 'FFB3BA', 'BFBFFF', 'C7CEEA'
  ];
  
  const colorIndex = title.length % colors.length;
  const color = colors[colorIndex];
  
  return `https://via.placeholder.com/300x300/${color}/FFFFFF?text=${encodeURIComponent(title.substring(0, 2).toUpperCase())}`;
};

export const getAudioThumbnail = (item: any): string => {
  // Priority: thumbnailUrl > imageUrl > default generated
  if (item?.thumbnailUrl) return item.thumbnailUrl;
  if (item?.imageUrl) return item.imageUrl;
  return getDefaultAudioThumbnail(item?.title || 'Audio');
};