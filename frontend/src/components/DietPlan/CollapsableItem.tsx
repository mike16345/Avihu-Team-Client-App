import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { ListItem } from '@rneui/themed';
import { Avatar, Image } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5'
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

export default function CollapsableItem({ meal, title }) {

    const [expanded, setExpanded] = useState(false);

    return (
        <View className='w-full items-start'>
            <ListItem.Accordion
                content={
                    <>
                        <ListItem.Title style={{ backgroundColor: 'black', color: 'white' }}>{title}</ListItem.Title>
                    </>
                }
                isExpanded={expanded}
                onPress={() => setExpanded(!expanded)}
                className='w-screen items-end'
                style={{ backgroundColor: 'black' }}
                containerStyle={{ backgroundColor: 'black' }}
            >
                <View className='flex-row-reverse w-screen items-center justify-center border-2'>
                    <ListItem containerStyle={{ backgroundColor: 'black' }}  >
                        <TouchableOpacity>
                            <View style={{ backgroundColor: 'black' }} className='flex-row items-center border-2 w-[33vw] justify-center'>
                                <Icon name='drumstick-bite' color='rgb(110 231 183)' size={24} />
                                <Text style={{ color: 'rgb(110 231 183)' }} className='text-lg pl-2' >{`${meal.totalProtein}g`}</Text>
                            </View>
                        </TouchableOpacity>
                    </ListItem>
                    <ListItem containerStyle={{ backgroundColor: 'black' }}>
                        <TouchableOpacity>
                            <View style={{ backgroundColor: 'black' }} className='flex-row items-center border-2 w-[30vw] justify-center'>
                                <Icon name='bread-slice' color='rgb(110 231 183)' size={24} />
                                <Text style={{ color: 'rgb(110 231 183)' }} className='text-lg pl-2'>{`${meal.totalCarbs}g`}</Text>
                            </View>
                        </TouchableOpacity>
                    </ListItem>
                    <ListItem containerStyle={{ backgroundColor: 'black' }}>
                        <TouchableOpacity>
                            <View style={{ backgroundColor: 'black' }} className='flex-row items-center border-2 w-[33vw] justify-center'>
                                <Icon name='carrot' color='rgb(110 231 183)' size={24} />
                                <Text style={{ color: 'rgb(110 231 183)' }} className='text-lg pl-2'>{`${meal.totalVeggies}`}</Text>
                            </View>
                        </TouchableOpacity>
                    </ListItem>
                </View>

            </ListItem.Accordion >
        </View >
    )
}