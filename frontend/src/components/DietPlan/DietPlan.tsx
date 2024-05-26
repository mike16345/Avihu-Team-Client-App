import { View, Text, ImageBackground } from 'react-native'
import React, { useState } from 'react'
import dietPlan from '../../constants/dietPlan.json'
import CollapsableItem from './CollapsableItem';
import logoBlack from '../../../assets/images/avihu-logo-black.png'

export default function DietPlan() {

    const [expanded, setExpanded] = useState<boolean>(false)
    const [meals, setMeals] = useState(dietPlan.meals)

    return (
        <View className='w-screen h-screen flex-1 bg-black '>
            <ImageBackground source={logoBlack} className='w-screen h-[40vh]' />
            {meals.map(meal => (
                <CollapsableItem key={meal.id} meal={meal} title={meal.title} />
            ))}

            <View className='w-screen  border-2 border-emerald-300 rounded '>
                <View className='flex-row justify-center py-2'>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>חזה עוף</Text>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>סלומון</Text>
                </View>
                <View className='flex-row justify-center  py-2'>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>שייטל מס' 13</Text>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>סינטה</Text>
                </View>
                <View className='flex-row justify-center  py-2'>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>פסטרמה</Text>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>פרגית</Text>
                </View>
                <View className='flex-row justify-center  py-2'>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>כתף מס' 4</Text>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>אנטריקוט</Text>
                </View>
                <View className='flex-row justify-center  py-2'>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>דג אמנון</Text>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>פילה בקר</Text>
                </View>
                <View className='flex-row justify-center  py-2'>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>דניס</Text>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>בשר טחון</Text>
                </View>
                <View className='flex-row justify-center  py-2'>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>טופו</Text>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>מעדן חלבון-150 קלוריות</Text>
                </View>
                <View className='flex-row justify-center  py-2'>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>קופסת טונה</Text>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>סקופ אבקת חלבון</Text>
                </View>
                <View className='flex-row justify-center  py-2'>
                    <Text className='text-emerald-300 w-1/2 text-right px-10'>משקה חלבון פרו יטבתה (זירו)</Text>
                </View>
            </View>
        </View>
    )
}