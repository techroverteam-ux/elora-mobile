import React from 'react'
import FastImage, { Source, ResizeMode as FastImageResizeMode } from 'react-native-fast-image'

type ResizeMode = 'contain' | 'cover' | 'stretch' | 'center'

type CustomFastImageProps = {
  imageUrl: string | number
  style?: any
  resizeMode?: ResizeMode
}

const CustomFastImage: React.FC<CustomFastImageProps> = ({
  imageUrl,
  style,
  resizeMode = 'stretch',
}) => {
  let source: number | Source

  if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
    source = {
      uri: imageUrl,
      headers: { Authorization: 'someAuthToken' },
      priority: FastImage.priority.normal,
    }
  } else {
    // local asset (require('path/to/image'))
    source = imageUrl as number
  }

  return <FastImage source={source} style={style} resizeMode={resizeMode as FastImageResizeMode} />
}

export default CustomFastImage
