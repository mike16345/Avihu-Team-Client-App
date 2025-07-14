import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import NativeIcon from '@/components/Icon/NativeIcon'
import useColors from '@/styles/useColors'
import useStyles from '@/styles/useGlobalStyles'
import ButtonShadow from '../ButtonShadow'

const IconButton = () => {
  const {colors,common,fonts,layout,spacing,text}=useStyles()


  return (
    <ButtonShadow>
      <TouchableOpacity style={[colors.backgroundSurface,spacing.pdLg,common.rounded,common.borderXsm,colors.outline]}>
        <NativeIcon library='AntDesign' name='API' size={fonts.lg.fontSize}/>
      </TouchableOpacity>
    </ButtonShadow>
  )
}

export default IconButton