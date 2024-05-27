import { View, ImageBackground } from 'react-native'
import React, { useState } from 'react'
import dietPlan from '../../constants/dietPlan.json'
import CollapsableItem from './CollapsableItem';
import logoBlack from '../../../assets/images/avihu-logo-black.png'
import CarbTable from './CarbTable';
import ProtienTable from './ProtienTable';

export default function DietPlan() {
    const UI_TYPES = {
        STANDARD: 'STANDARD',
        CARBS: 'CARBS',
        PROTEIN: 'PROTEIN'
    }

    const [meals, setMeals] = useState(dietPlan.meals)
    const [uiView, setUiView] = useState(UI_TYPES.STANDARD)



    return (
        <View className='w-screen h-screen flex-1 bg-black '>
            <ImageBackground source={logoBlack} className='w-screen h-[40vh]' />
            {meals.map(meal => (
                <CollapsableItem key={meal.id} meal={meal} title={meal.title} setter={setUiView} uiTypes={UI_TYPES} />
            ))}
            {uiView === UI_TYPES.CARBS && <CarbTable setter={setUiView} uiTypes={UI_TYPES} />}
            {uiView === UI_TYPES.PROTEIN && <ProtienTable setter={setUiView} uiTypes={UI_TYPES} />}

        </View>
    )
}