import { View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'

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
        if (inputtedCrendentials.email) {
            const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(inputtedCrendentials.email)) {
                errors[`email`] = `אנא הכניסו כתובת מייל תקינה`
            }
        }
        if (hardcodedUser.email === inputtedCrendentials.email &&
            hardcodedUser.password === inputtedCrendentials.password) {
            console.log(`yay`);
        } else {
            console.log(`nay`);

        }
    }


    return (
        <View>
            <Text onPress={Keyboard.dismiss}>Login</Text>

            <View>
                <TextInput
                    placeholder='אימייל..'
                    className='inpt '
                    keybardType='email-address'
                    onChangeText={(val) => setInputtedCredentials({ ...inputtedCrendentials, email: val })}
                />
                <TextInput
                    placeholder='סיסמא..'
                    className='inpt'
                    secureTextEntry={true}
                    onChangeText={(val) => setInputtedCredentials({ ...inputtedCrendentials, password: val })}
                />

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