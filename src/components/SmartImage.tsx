import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ImageIcon, AlertCircle } from 'lucide-react-native';
import imageService from '../services/imageService';

interface SmartImageProps {
  source: string | number | null | undefined;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  onPress?: () => void;
  showPlaceholder?: boolean;
  placeholderText?: string;
  fallbackColor?: string;
}

const SmartImage: React.FC<SmartImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  onPress,
  showPlaceholder = true,
  placeholderText = 'No Image',
  fallbackColor = '#f0f0f0'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle empty/null source
  if (!source) {
    return (
      <TouchableOpacity 
        style={[style, { backgroundColor: fallbackColor, justifyContent: 'center', alignItems: 'center' }]}
        onPress={onPress}
        disabled={!onPress}
      >
        {showPlaceholder && (
          <>
            <ImageIcon size={24} color="#ccc" />
            <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{placeholderText}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Handle error state
  if (error) {
    return (
      <TouchableOpacity 
        style={[style, { backgroundColor: '#fee', justifyContent: 'center', alignItems: 'center' }]}
        onPress={onPress}
        disabled={!onPress}
      >
        {showPlaceholder && (
          <>
            <AlertCircle size={24} color="#f87171" />
            <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>Failed to load</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Determine image source
  let imageSource: any;
  
  if (typeof source === 'number') {
    // Local asset
    imageSource = source;
  } else if (typeof source === 'string') {
    if (source.startsWith('http://') || source.startsWith('https://')) {
      // Already full URL
      imageSource = { uri: source };
    } else {
      // Relative path - convert to full URL
      imageSource = { uri: imageService.getFullImageUrl(source) };
    }
  }

  const ImageComponent = (
    <View style={style}>
      <Image
        source={imageSource}
        style={[style, { position: 'absolute' }]}
        resizeMode={resizeMode}
        onLoad={() => {
          setLoading(false);
          setError(false);
        }}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      
      {loading && (
        <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: fallbackColor }]}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>Loading...</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={{ borderRadius: 8, overflow: 'hidden' }}>
        {ImageComponent}
      </TouchableOpacity>
    );
  }

  return ImageComponent;
};

export default SmartImage;