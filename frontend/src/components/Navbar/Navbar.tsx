import React from 'react'
import { View, Text } from 'react-native'

const Navbar = () => {
  return (
    <View className='flex justify-between items-center'>
      <Text>Home</Text>
      <Text>Workout Plan</Text>
      <Text>Diet Plan</Text>
    </View>
  )
}

export default Navbar

