import React from 'react'
import FastImage from 'react-native-fast-image'

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
  const isRemoteImage = typeof imageUrl === 'string' && imageUrl.startsWith('http')

  const source = isRemoteImage
    ? {
      uri: imageUrl,
      headers: { Authorization: 'someAuthToken' },
      priority: FastImage.priority.normal,
    }
    : imageUrl

  return <FastImage source={source} style={style} resizeMode={resizeMode} />
}

export default CustomFastImage
