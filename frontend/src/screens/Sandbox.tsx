import { View, Text } from 'react-native'
import React from 'react'
import useStyles from '@/styles/useGlobalStyles'
import PrimaryButton from '@/components/ui/PrimaryButton'
import NativeIcon from '@/components/Icon/NativeIcon'

const Sandbox = () => {
    const {colors,spacing,layout}=useStyles()

  return (
    <View style={[spacing.pdBottomBar,spacing.pdStatusBar,spacing.pdDefault,colors.background,layout.sizeFull]}>
      <Text style={[colors.textPrimary]}>Sandbox</Text>

      <PrimaryButton mode='light' label='התחברות' block icon={<NativeIcon library='AntDesign' name='API' size={24}/>} loading/>
    </View>
  )
}

export default Sandbox