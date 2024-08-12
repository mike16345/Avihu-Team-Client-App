import { Colors } from '@/constants/Colors'
import { IMeal } from '@/interfaces/DietPlan'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import NativeIcon from '../Icon/NativeIcon'
import CustomInstructionsContainer from './CustomInstructionsContainer'

interface MealContainerProps{
    meal:IMeal
}

const MealContainer:React.FC<MealContainerProps> = ({meal}) => {
    const { totalCarbs, totalProtein, totalFats, totalVeggies} =meal
  return (
    <View style={styles.mealItemsContainer}>
            {totalProtein.customInstructions && totalProtein.customInstructions[0] ?
                <CustomInstructionsContainer
                    customInstructions={totalProtein.customInstructions}
                    icon='fish'
                    foodGroup='חלבונים'
                />
             :
            totalProtein && totalProtein.quantity > 0 &&
                <View style={styles.mealItems}>
                    <NativeIcon library='MaterialCommunityIcons' name='fish' size={20} color={Colors.primary}/>
                    <Text style={styles.mealItemsText}>חלבונים: {totalProtein.quantity}</Text>
                </View>
            }

            {totalCarbs.customInstructions && totalCarbs.customInstructions[0] ? 
               <CustomInstructionsContainer 
                    customInstructions={totalCarbs.customInstructions}
                    icon='baguette'
                    foodGroup='פחמימות'
                />
           :totalCarbs.quantity > 0 &&
                <View style={styles.mealItems}>
                    <NativeIcon library='MaterialCommunityIcons' name='baguette' size={20} color={Colors.primary}/>
                    <Text style={styles.mealItemsText}>פחמימות: {totalCarbs.quantity}</Text>
                </View>
            }
            {totalFats && totalFats.quantity > 0 &&
                <View style={styles.mealItems}>
                    <NativeIcon library='MaterialCommunityIcons' name='cheese' size={20} color={Colors.primary}/> 
                    <Text style={styles.mealItemsText}>שומנים: {totalFats?.quantity}</Text>
                </View>
            }
            {totalVeggies && totalVeggies?.quantity > 0 &&
                <View style={styles.mealItems}>
                    <NativeIcon library='MaterialCommunityIcons' name='leaf' size={20} color={Colors.primary}/>
                    <Text style={styles.mealItemsText}>ירקות: {totalVeggies?.quantity}</Text>
                </View>
            }
    </View>
  )
}

const styles=StyleSheet.create({
    mealItemsContainer:{
        direction:"rtl",
        display:'flex',
        flexDirection:"row",
        justifyContent:'flex-start',
        flexWrap:`wrap`,
        gap:8,
        width:'80%',
        padding:10
    },
    mealCol:{
        display:`flex`,
        alignItems:`flex-start`,
        justifyContent:`flex-end`,
    },
    mealItems:{
        display:'flex',
        flexDirection:"row",
        alignItems:"center",
        gap:5,
        paddingVertical:5,
        padding:5,
        borderRadius:10
    },
    mealItemsText:{
    color:Colors.light,  
    }
})

export default MealContainer
