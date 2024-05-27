import React from 'react'
import Icon from 'react-native-vector-icons/EvilIcons'
import { View, Text, TouchableOpacity } from 'react-native'


const CarbTable = ({ setUiState, uiStates }) => {
    return (
        <View  className='w-screen p-2 border-2 border-emerald-300 rounded absolute bg-black top-12 gap-2'>
            <View className='items-end'>
                <TouchableOpacity onPress={() => setUiState(uiStates.STANDARD)}>
                    <Icon style={{ padding: 5 }} name='close-o' color='rgb(110 231 183)' size={32} />
                </TouchableOpacity>
            </View>
            <View className='items-center'>
                <Text className='text-emerald-300 text-2xl py-4 font-bold underline'>מנות פחמימה</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>90 גרם קוסקוס</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>60 גרם פתיתים / פסטה</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>120 גרם בורגול</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>90 גרם קינואה</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>100 גרם עדשים</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>110 גרם תפוח אדמה</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>110 גרם בטטה</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>130 גרם אפונה</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>70 גרם גרגירי חומוס</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>2 פרוסות לחם לבן / חום</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>פיתה 1- של 100 קלוריות</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>פיתה רגילה = 2 מנות פחמימה</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>5 קרקרים של פיטנס</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>6 פירכיות פיטנס</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>3 וחצי פירכיות אורז</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>4 דפי אורז (ספרינג רול)</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>30 גרם שיבולת שועל</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>30 גרם גרנולה</Text>
            </View>
            <View className='flex-row-reverse justify-center '>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>30 גרם קורנפלקס</Text>
                <Text className='text-emerald-300 w-1/2 text-right px-10'>80 גרם אורז</Text>
            </View>
        </View>
    )
}

export default CarbTable
