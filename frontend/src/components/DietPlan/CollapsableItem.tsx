import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { ListItem } from '@rneui/themed';
import chicken from '../../../assets/images/chicken-icon.svg'
import bread from '../../../assets/images/bread-icon.svg'
import vegetable from '../../../assets/images/vegetable-icon.svg'
import { Avatar, Image } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5'

export default function CollapsableItem({ meal, title }) {

    const [expanded, setExpanded] = useState(false);

    return (
        <View className='w-full items-end'>
            <ListItem.Accordion
                content={
                    <>
                        <ListItem.Title>{title}</ListItem.Title>
                    </>
                }
                isExpanded={expanded}
                onPress={() => setExpanded(!expanded)}
                className='bg-slate-400'
            >
                <View className='flex-row'>
                    <ListItem className='flex-row'>
                        <Icon name='drumstick-bite' />
                        <Text>{`${meal.totalProtein}g`}</Text>
                    </ListItem>
                    <ListItem>
                        <Icon name='bread-slice' />
                        <Text>{`${meal.totalCarbs}g`}</Text>
                    </ListItem>
                    <ListItem>
                        <Icon name='carrot' />
                        <Text>{`${meal.totalVeggies}`}</Text>
                    </ListItem>
                </View>

            </ListItem.Accordion>
        </View>
    )
}