import React from 'react'
import { View, Text, Button } from 'react-native'

const Navbar = () => {
  return (
    <View className='flex flex-row w-full justify-around p-2 items-center bg-gray-500 rounded-lg '>
      <Button title='Home' onPress={()=>{
        console.log('do something')
      }}/>
      <Text className='text-white font-bold'>Home</Text>
      <Text className='text-white font-bold'>Workout Plan</Text>
      <Text className='text-white font-bold'>Diet Plan</Text>
    </View>
  )
}

export default Navbar

