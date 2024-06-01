import React from 'react'
import Icon from 'react-native-vector-icons/EvilIcons'
import { View, Text, TouchableOpacity } from 'react-native'

const ProtienTable = ({ setUiState, uiStates }) => {
    return (
        <View className='w-screen  border-2 border-emerald-300 rounded  bg-black  gap-4 '>
            <View className='items-end'>
                <TouchableOpacity onPress={() => setUiState(uiStates.STANDARD)}>
                    <Icon style={{ padding: 5 }} name='close-o' color='rgb(110 231 183)' size={32} />
                </TouchableOpacity>

            </View>
            <View className='items-center'>
                <Text className='text-emerald-300 text-2xl py-4 font-bold underline'>מנות חלבון</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>100 גרם חזה עוף</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'> 80 גרם סלומון</Text>
            </View>
            <View className='flex-row-reverse justify-center  '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>100 גרם שייטל מס' 13</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>80 גרם סינטה</Text>
            </View>
            <View className='flex-row-reverse justify-center  '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>100 גרם פסטרמה</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>80 גרם פרגית</Text>
            </View>
            <View className='flex-row-reverse justify-center  '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>100 גרם כתף מס' 4</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>80 גרם אנטריקוט</Text>
            </View>
            <View className='flex-row-reverse justify-center  '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>100 גרם דג אמנון</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>80 גרם פילה בקר</Text>
            </View>
            <View className='flex-row-reverse justify-center  '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>100 גרם דניס</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>80 גרם בשר טחון</Text>
            </View>
            <View className='flex-row-reverse justify-center  '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>100 גרם טופו</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>מעדן חלבון-150 קלוריות</Text>
            </View>
            <View className='flex-row-reverse justify-center  '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>קופסת טונה</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>סקופ אבקת חלבון</Text>
            </View>
            <View className='flex-row justify-center  pb-4'>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>משקה חלבון פרו יטבתה (זירו)</Text>
            </View>
        </View>
    )
}

export default ProtienTable
