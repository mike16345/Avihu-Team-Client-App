import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import useStyles from '@/styles/useGlobalStyles'
import NativeIcon from '../../Icon/NativeIcon';
import { ConditionalRender } from '../ConditionalRender';
import SpinningIcon from '../loaders/SpinningIcon';


interface PrimaryButtonProps {
label:string;
mode:'dark'|'light';
block?:boolean;
icon?:any;
loading?:boolean
  }

const PrimaryButton:React.FC<PrimaryButtonProps> = ({label,mode='dark',block,icon,loading}) => {
    const {colors,common,fonts,layout,spacing,text}=useStyles()

  return (
    <TouchableOpacity disabled={loading} style={[layout.center,spacing.pdDefault,common.rounded,mode=='dark'?colors.backgroundPrimary:[colors.backgroundSurface,common.borderXsm,colors.outline],layout.flexRow,spacing.gapDefault,layout.itemsCenter, block?layout.widthFull:{alignSelf:'flex-start'} ]}>
        <ConditionalRender condition={!loading} children={
            <> 
                {icon}
                <Text style={[mode=='dark'?colors.textOnPrimary:colors.textPrimary,text.textBold,]}>
                    {label}
                </Text>
            </>
        }/>

        <ConditionalRender condition={loading} children={<SpinningIcon mode={mode}/> }/>
    </TouchableOpacity>
  )
}

export default PrimaryButton