import { View, Text } from 'react-native'
import React, { useState } from 'react'
import dietPlan from '../../constants/dietPlan.json'

import { Image } from 'react-native-elements';
import CollapsableItem from './CollapsableItem';

export default function DietPlan() {

    const [expanded, setExpanded] = useState<boolean>(false)
    const [meals, setMeals] = useState(dietPlan.meals)

    return (
        <View className='w-screen'>
            {meals.map(meal=>(
            <CollapsableItem key={meal.id} meal={meal} title={meal.title} />
            ))}
        </View>
    )
}