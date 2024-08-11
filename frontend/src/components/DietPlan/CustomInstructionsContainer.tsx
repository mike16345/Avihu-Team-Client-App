import { ICustomItemInstructions } from '@/interfaces/DietPlan'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import NativeIcon from '../Icon/NativeIcon'
import { MaterialCommunityIconsNames } from '@/types/iconTypes'
import { Colors } from '@/constants/Colors'

interface CustomInstructionsContainerProps{
    customInstructions:ICustomItemInstructions[]
    icon:MaterialCommunityIconsNames
    foodGroup:string
}

const CustomInstructionsContainer:React.FC<CustomInstructionsContainerProps> = ({customInstructions, icon, foodGroup}) => {
  return (
    <View>
        <View style={styles.title}>
            <NativeIcon 
                library='MaterialCommunityIcons' 
                name={icon}
                size={16} 
                color={Colors.primary}
            />
            <Text style={styles.textColor}>{foodGroup}:</Text>
        </View>
        <View style={styles.itemsContainer}> 
            {customInstructions.map((item, i)=>(
                <Text style={styles.textColor}>{item.item}: {item.quantity} {i+1 !==customInstructions.length ? `/`:``} </Text>
            ))}
        </View>
    </View>
  )
}

const styles=StyleSheet.create({
    title:{
        display:`flex`,
        flexDirection:`row`,
        gap:2,
        paddingBottom:5
    },
    textColor:{
        color:Colors.light
    },
    itemsContainer:{
        display:`flex`,
        flexDirection:`row`,
        justifyContent:`center`,
        width:`100%`,
        padding:5,
        gap:5
    }
})

export default CustomInstructionsContainer
