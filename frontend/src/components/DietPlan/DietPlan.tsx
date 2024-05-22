import { View, Text } from 'react-native'
import React, { useState } from 'react'
import dietPlan from './dietPlan.json'

import { Image } from 'react-native-elements';
import CollapsableItem from './CollapsableItem';

export default function DietPlan() {

    const [expanded, setExpanded] = useState<boolean>(false)
    const [meal, setMeals] = useState(dietPlan.meals)

    return (
        <View className='w-screen'>
            <CollapsableItem meal={meal[1]} title='ארוחה ראשונה' />
        </View>
    )
}