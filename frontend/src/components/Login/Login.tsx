import { View, TouchableOpacity, Keyboard, ImageBackground } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Image, Input, Text } from 'react-native-elements';
import avihuBg from './avihuBg.jpeg'

export default function Login() {

    const hardcodedUser = {
        email: `avihu123@gmail.com`,
        password: `qwerty123`
    }

    const [inputtedCrendentials, setInputtedCredentials] = useState<{ email: string, password: string }>({ email: ``, password: `` });
    const [status, setStatus] = useState<string>(``);
    const [formErrors, setFormErrors] = useState<array>([])

    const handleSubmit = () => {
        Keyboard.dismiss()

        const errors: array = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(inputtedCrendentials.email) || !inputtedCrendentials.email) {
            errors[`email`] = `אנא הכניסו כתובת מייל תקינה`
        }

        if (!inputtedCrendentials.password) {
            errors[`password`] = `אנא הזינו סיסמא`
        }

        if (errors.length == 0) {

            if (hardcodedUser.email === inputtedCrendentials.email &&
                hardcodedUser.password === inputtedCrendentials.password) {
                setStatus(`התחברות בוצעה בהצלחה`)
            } else {
                setStatus(`התחברות נכשלה!`)
            }

        }
        setFormErrors(errors);
    }


    return (
        <View className='flex-1 w-screen justify-center ' >
            <ImageBackground source={avihuBg} className='w-full h-full flex-1 absolute z-0' />
            <View className=' w-full h-full absolute top-0 left-0 bg-black opacity-55 z-10'></View>
            <View className='w-full items-center z-30'>
                <Text onPress={() => Keyboard.dismiss()} className='text-4xl text-center pb-8'>כניסה לחשבונך</Text>
                <View className=' w-80'>
                    <Input
                        placeholder='אימייל..'
                        className='inpt '
                        errorMessage={formErrors[`email`]}
                        errorStyle={{ textAlign: 'right' }}
                        onChangeText={(val) => setInputtedCredentials({ ...inputtedCrendentials, email: val.toLocaleLowerCase().trim() })}
                    />
                </View>
                <View className='w-80'>
                    <Input
                        placeholder='סיסמא..'
                        className='inpt'
                        errorMessage={formErrors[`password`]}
                        errorStyle={{ textAlign: 'right' }}
                        secureTextEntry={true}
                        onChangeText={(val) => setInputtedCredentials({ ...inputtedCrendentials, password: val })}
                    />
                </View>

                <TouchableOpacity >
                    <Text className='pb-6 underline text-right'>הרשמה</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSubmit}>
                    <Text className='bg-emerald-300 text-center py-2'>התחברות</Text>
                </TouchableOpacity>

                <Text className='text-center pt-6'>{status}</Text>
            </View>
        </View>
    )
}