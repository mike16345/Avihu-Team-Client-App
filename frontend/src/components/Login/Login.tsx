import { View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Input } from 'react-native-elements';

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
                console.log(`yay`);
            } else {
                console.log(`nay`);

            }
        }
        setFormErrors(errors);

    }


    return (
        <View>
            <Text onPress={Keyboard.dismiss}>Login</Text>

            <View>
                <View className='w-72'>
                    <Input
                        placeholder='אימייל..'
                        className='inpt '
                        errorMessage={formErrors[`email`]}
                        errorStyle={{ textAlign: 'right' }}
                        onChangeText={(val) => setInputtedCredentials({ ...inputtedCrendentials, email: val.toLocaleLowerCase().trim() })}
                    />
                </View>
                <View className='w-72'>
                    <Input
                        placeholder='סיסמא..'
                        className='inpt'
                        errorMessage={formErrors[`password`]}
                        errorStyle={{ textAlign: 'right' }}
                        secureTextEntry={true}
                        onChangeText={(val) => setInputtedCredentials({ ...inputtedCrendentials, password: val })}
                    />
                </View>

                <TouchableOpacity>
                    <Text className='pb-6 underline text-green-300 text-right'>הרשמה</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSubmit}>
                    <Text className='bg-green-200 text-center py-2 '>התחברות</Text>
                </TouchableOpacity>

                <Text>{status}</Text>
            </View>
        </View>
    )
}