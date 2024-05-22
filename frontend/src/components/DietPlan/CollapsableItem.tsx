import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { ListItem } from '@rneui/themed';
import chicken from '../../../assets/images/chicken-icon.svg'
import bread from '../../../assets/images/bread-icon.svg'
import vegetable from '../../../assets/images/vegetable-icon.svg'
import { Avatar, Icon, Image } from 'react-native-elements';

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
                        <Avatar source={chicken} size={'medium'} rounded />
                        <Text>{`${meal.totalProtein}g`}</Text>
                    </ListItem>
                    <ListItem>
                        <Text>{`${meal.totalCarbs}g`}</Text>
                    </ListItem>
                    <ListItem>
                        <Text>{`${meal.totalVeggies}`}</Text>
                    </ListItem>
                </View>

            </ListItem.Accordion>
        </View>
    )
}