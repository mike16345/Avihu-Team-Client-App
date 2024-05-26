import { View, Text } from 'react-native'
import React from 'react'
import DietPlan from '../components/DietPlan/DietPlan'

export default function MyDietPlanPage() {
    return (
        <View className='flex-1'>
            <DietPlan />
        </View>
    )
}