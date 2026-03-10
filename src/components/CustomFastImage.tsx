import React, { useState } from 'react'
import { View, Text } from 'react-native'
import FastImage, { Source, ResizeMode as FastImageResizeMode } from 'react-native-fast-image'
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons'
import imageService from '../services/imageService'

type ResizeMode = 'contain' | 'cover' | 'stretch' | 'center'

type CustomFastImageProps = {
  imageUrl: string | number
  style?: any
  resizeMode?: ResizeMode
  showPlaceholder?: boolean
}

const CustomFastImage: React.FC<CustomFastImageProps> = ({
  imageUrl,
  style,
  resizeMode = 'cover',
  showPlaceholder = true,
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // If no imageUrl provided or error occurred, show placeholder
  if (!imageUrl || hasError) {
    return (
      <View style={[style, {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
      }]}>
        {showPlaceholder && (
          <>
            <MaterialDesignIcons name="image-outline" size={40} color="#ccc" />
            <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>No Image</Text>
          </>
        )}
      </View>
    )
  }

  let source: number | Source

  if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
    source = {
      uri: imageUrl,
      priority: FastImage.priority.normal,
    }
  } else if (typeof imageUrl === 'string') {
    // Convert relative path to full URL
    const fullUrl = imageService.getFullImageUrl(imageUrl)
    source = {
      uri: fullUrl,
      priority: FastImage.priority.normal,
    }
  } else {
    // local asset (require('path/to/image'))
    source = imageUrl as number
  }

  return (
    <FastImage 
      source={source} 
      style={style} 
      resizeMode={resizeMode as FastImageResizeMode}
      onError={() => {
        console.log('Image failed to load:', imageUrl)
        setHasError(true)
        setIsLoading(false)
      }}
      onLoad={() => {
        setIsLoading(false)
        setHasError(false)
      }}
    />
  )
}

export default CustomFastImage
