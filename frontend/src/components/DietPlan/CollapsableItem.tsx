import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { ListItem } from '@rneui/themed';
import { Avatar, Image } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5'

export default function CollapsableItem({ meal, title }) {

    const [expanded, setExpanded] = useState(false);

    return (
        <View className='w-full items-start'>
            <ListItem.Accordion
                content={
                    <>
                        <ListItem.Title>{title}</ListItem.Title>
                    </>
                }
                isExpanded={expanded}
                onPress={() => setExpanded(!expanded)}
                className='w-screen items-end'
            >
                <View className='flex-row-reverse w-screen items-center justify-center border-2'>
                    <ListItem >
                        <View className='flex-row items-center border-2 w-[33vw] justify-center'>
                            <Icon  name='drumstick-bite' />
                            <Text className='text-lg pl-2' >{`${meal.totalProtein}g`}</Text>
                        </View>
                    </ListItem>
                    <ListItem>
                        <View className='flex-row items-center border-2 w-[30vw] justify-center'>
                            <Icon name='bread-slice' />
                            <Text className='text-lg pl-2'>{`${meal.totalCarbs}g`}</Text>
                        </View>
                    </ListItem>
                    <ListItem>
                        <View className='flex-row items-center border-2 w-[33vw] justify-center'>
                            <Icon name='carrot' />
                            <Text className='text-lg pl-2'>{`${meal.totalVeggies}`}</Text>
                        </View>
                    </ListItem>
                </View>

            </ListItem.Accordion>
        </View>
    )
}