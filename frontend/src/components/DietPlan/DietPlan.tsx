import { View, ImageBackground, ScrollView, TouchableOpacity, Text } from "react-native";
import React, { useState } from "react";
import dietPlan from "../../constants/dietPlan.json";
import CollapsableItem from "./CollapsableItem";
import logoBlack from "../../../assets/images/avihu-logo-black.png";
import CarbTable from "./CarbTable";
import ProtienTable from "./ProtienTable";

export default function DietPlan() {
  const UI_TYPES = {
    STANDARD: "STANDARD",
    CARBS: "CARBS",
    PROTEIN: "PROTEIN",
  };

  const [meals, setMeals] = useState(dietPlan.meals);
  const [uiView, setUiView] = useState(UI_TYPES.STANDARD);

  return (
    <ScrollView className="w-screen h-screen flex-1 bg-black  relative">
      <ImageBackground source={logoBlack} className="w-screen h-[30vh]" />

            <View className='flex-row justify-center gap-9 pb-6'>
                <TouchableOpacity onPress={()=>setUiView(UI_TYPES.PROTEIN)}>
                    <View className='bg-emerald-300 p-2 rounded'>
                        <Text className='text-lg font-bold'>חלבונים</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setUiView(UI_TYPES.CARBS)}>
                    <View className='bg-emerald-300 p-2 rounded'>
                        <Text className='text-lg font-bold'>פחמימות</Text>
                    </View>
                </TouchableOpacity>
            </View>
      {meals.map((meal) => (
        <View className='p-4 rtl items-center'
          key={meal.title}>
          <Text className='text-emerald-300 underline font-bold text-lg p-2'>{meal.title}</Text>
                    <View className='flex-row'>

                        {typeof(meal.optOne)==`string`?
          <Text className='text-white'>{meal.optOne}</Text> :

                        <View className='flex-row-reverse w-[100vw] flex-wrap p-1 justify-center'>
                            {meal.optOne.map((opt)=>(<Text className='text-white px-1'>{opt} /</Text>))}
                        </View>}

                    </View>
                    <Text className='text-emerald-300 font-bold'>+</Text>
                    <View className='flex-row-reverse gap-2'>

                        <Text className='text-white py-1'>{meal.optTwo}</Text>
                        <Text className='text-emerald-300 font-bold py-1'>+</Text>
                        <Text className='text-white py-1'>{meal.optThree}</Text>
                    </View>
          </View>
          ))}

      <View className='absolute top-[35vh]'>
      {uiView === UI_TYPES.CARBS && <CarbTable setUiState={setUiView} uiStates={UI_TYPES} />}
      {uiView === UI_TYPES.PROTEIN && <ProtienTable setUiState={setUiView} uiStates={UI_TYPES} />}</View>
    </ScrollView>
  );
}
