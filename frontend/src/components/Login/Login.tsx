import { View, TouchableOpacity, Keyboard, ImageBackground,Text, KeyboardAvoidingView } from 'react-native'
import React, { useState } from 'react'
import { Input } from 'react-native-elements';
import avihuBg from './avihuBg.jpeg'

export default function Login() {

    const hardcodedUser = {
        email: `avihu123@gmail.com`,
        password: `qwerty123`
    }

    const [inputtedCrendentials, setInputtedCredentials] = useState<{ email: string, password: string }>({ email: ``, password: `` });
    const [status, setStatus] = useState<string>();
    const [formErrors, setFormErrors] = useState<array>([]);
    const [didSucceed, setDidSucceed] = useState<boolean>()

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

        if (!errors[`email`] && !errors[`password`]) {

            if (hardcodedUser.email === inputtedCrendentials.email &&
                hardcodedUser.password === inputtedCrendentials.password) {
                setStatus(`התחברות בוצעה בהצלחה`)
                setDidSucceed(true)
            } else {
                setStatus(`התחברות נכשלה!`)
                setDidSucceed(false)
            }

        }
        setFormErrors(errors);
    }


    return (
        <View className='flex-1 w-screen justify-center ' >
            <ImageBackground source={avihuBg} className='w-full h-full flex-2 absolute z-0' />
            <View className=' w-full h-full absolute top-0 left-0 bg-black opacity-55 z-10'></View>
            <KeyboardAvoidingView behavior='padding' className='w-full items-center z-30'>
                <Text  className='text-5xl text-center text-emerald-300 font-bold pb-8'>כניסה לחשבון</Text>
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
                    <Text className='pb-6 w-72 underline text-right text-emerald-300'>הרשמה</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSubmit}>
                    <Text className='bg-emerald-300 text-center py-2 w-72 font-bold'>התחברות</Text>
                </TouchableOpacity>

                { didSucceed ? (
                            <Text className='text-emerald-300 pt-8 text-lg'>{status}</Text>
                        ) : (
                            <Text className='text-red-700 pt-8 text-lg'>{status}</Text>
                        )
                    }
            </KeyboardAvoidingView>
        </View>
    )
}