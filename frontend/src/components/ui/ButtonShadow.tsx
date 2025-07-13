import { View } from 'react-native'
import { useShadowStyles } from '@/styles/useShadowStyles'


interface buttonShadowProps {
children:any,
style?:any[]
  }

const ButtonShadow:React.FC<buttonShadowProps> = ({children,style}) => {
    const {buttonLayer1,buttonLayer2,buttonLayer3,buttonLayer4,buttonLayer5}=useShadowStyles()


  return (
    <View style={[buttonLayer1, style]}>
    <View style={buttonLayer2}>
      <View style={buttonLayer3}>
        <View style={buttonLayer4}>
          <View style={buttonLayer5}>
            {children}
          </View>
        </View>
      </View>
    </View>
  </View>
  )
}

export default ButtonShadow