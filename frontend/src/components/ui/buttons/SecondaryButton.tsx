import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import useStyles from '@/styles/useGlobalStyles';
import { ConditionalRender } from '../ConditionalRender';
import ButtonShadow from '../ButtonShadow';
import shadow from 'react-native-paper/src/styles/shadow';

interface secondaryButtonProps {
label:string;
leadingIcon?:any;
trailingIcon?:any;
size?:'sm'|'md'
shadow?:boolean
  }

const SecondaryButton:React.FC<secondaryButtonProps> = ({label,leadingIcon,trailingIcon,size='md',shadow=true}) => {
    const {colors,common,fonts,layout,spacing,text}=useStyles()

  return (
    <ButtonShadow shadow={shadow}>
    <TouchableOpacity style={[colors.backgroundSurface,common.rounded,common.borderXsm,colors.outline,{alignSelf:'flex-start'},layout.flexRow,layout.center,spacing.gapDefault,size=='md'?spacing.pdSm:spacing.pdXs]}>
        <ConditionalRender condition={leadingIcon} children={leadingIcon}/>
      <Text style={[size=='sm'?fonts.sm:fonts.md]}>{label}</Text>
      <ConditionalRender condition={trailingIcon} children={trailingIcon}/>
    </TouchableOpacity>
    </ButtonShadow>
  )
}

export default SecondaryButton