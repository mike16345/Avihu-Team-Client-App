import { View } from 'react-native'
import { useShadowStyles } from '@/styles/useShadowStyles'

interface FrameShadowProps {
 children: any,
 style?: any[]
}

const FrameShadow: React.FC<FrameShadowProps> = ({ children, style }) => {
 const { frameLayer1, frameLayer2, frameLayer3, frameLayer4, frameLayer5 } = useShadowStyles()

 return (
   <View style={[frameLayer1, style]}>
     <View style={frameLayer2}>
       <View style={frameLayer3}>
         <View style={frameLayer4}>
           <View style={frameLayer5}>
             {children}
           </View>
         </View>
       </View>
     </View>
   </View>
 )
}

export default FrameShadow