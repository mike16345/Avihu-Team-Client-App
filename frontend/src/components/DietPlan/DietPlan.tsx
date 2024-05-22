import { View, Text } from 'react-native'
import React, { useState } from 'react'
import dietPlan from './dietPlan.json'
import { ListItem } from '@rneui/themed';
import chicken from '../../../assets/images/chicken-icon.svg'
import bread from '../../../assets/images/bread-icon.svg'
import vegetable from '../../../assets/images/vegetable-icon.svg'
import { Image } from 'react-native-elements';

export default function DietPlan() {

    const [expanded, setExpanded] = useState<boolean>(false)
    const [meal, setMeals] = useState(dietPlan.meals)

    return (
        <View className='w-screen'>
            <ListItem.Accordion
                content={
                    <>
                        <ListItem.Title>ארוחה 1:</ListItem.Title>
                    </>
                }
            >
                <ListItem>

                </ListItem>

            </ListItem.Accordion>
        </View>
    )
}