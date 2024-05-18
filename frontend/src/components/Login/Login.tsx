import { View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'

export default function Login() {

    const hardcodedUser={
        email:`avihu123@gmail.com`,
        password:`qwerty123`
    }

    const [inputtedCrendentials, setInputtedCredentials] = useState<{email:string, password:string}>({email:``, password:``});
    const [status, setStatus]= useState<string>(``);

    const handleSubmit=()=>{
        if (hardcodedUser.email===inputtedCrendentials.email &&
            hardcodedUser.password===inputtedCrendentials.password) {
            console.log(`yay`);
        }else{
            console.log(`nay`);
            
        }
    }

    useEffect(()=>{
        console.log(inputtedCrendentials);
        
    },[inputtedCrendentials])

    return (
        <View>
        <Text onPress={Keyboard.dismiss}>Login</Text>

            <View>
                <TextInput
                    placeholder='Email..'
                    className='inpt'
                    onChangeText={(val)=> setInputtedCredentials({...inputtedCrendentials, email:val})}
                />
                <TextInput
                    placeholder='Password..'
                    className='inpt'
                    onChangeText={(val)=> setInputtedCredentials({...inputtedCrendentials, password:val})}
                />

                <TouchableOpacity>
                    <Text className='pb-6 underline text-green-300'>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={()=>{handleSubmit(); Keyboard.dismiss}}>
                    <Text className='bg-green-200 text-center py-2 '>Log in</Text>
                </TouchableOpacity>

                <Text>{status}</Text>
            </View>
        </View>
    )
}