import { View, ImageBackground, ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import logoBlack from "../../../assets/images/avihu-logo-black.png";
import CarbTable from "./CarbTable";
import ProteinTable from "./ProteinTable";
import useHideTabBarOnScroll from "@/hooks/useHideTabBarOnScroll";
import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { useUserStore } from "@/store/userStore";
import { IDietPlan } from "@/interfaces/DietPlan";
import MealContainer from "./MealContainer";
import { Colors } from "@/constants/Colors";
import useFontSize from "@/styles/useFontSize";

export default function DietPlan() {
  const UI_TYPES = {
    STANDARD: "STANDARD",
    CARBS: "CARBS",
    PROTEIN: "PROTEIN",
  };

  const { handleScroll } = useHideTabBarOnScroll();
  const currentUser = useUserStore((state) => state.currentUser);
  const {getDietPlanByUserId}=useDietPlanApi()
  const {lg}=useFontSize()

  const [dietPlan,setDietPlan]=useState<IDietPlan|null>(null)
  const [meals, setMeals] = useState();
  const [uiView, setUiView] = useState(UI_TYPES.STANDARD);
  const scrollRef = useRef(null);

  useEffect(()=>{
    if (!currentUser) return 

    getDietPlanByUserId(currentUser?._id)
    .then(res=> setDietPlan(res))
    .catch(err=>console.log(err))
  },[])


  return (
    <ScrollView
      ref={scrollRef}
      onScroll={handleScroll}
      className="w-screen h-screen flex-1 bg-black  relative"
    >
      <ImageBackground source={logoBlack} className="w-screen h-[30vh]" />

      <View className="flex-row justify-center gap-9 pb-6">
        <TouchableOpacity onPress={() => setUiView(UI_TYPES.PROTEIN)}>
          <View className="bg-emerald-300 p-2 rounded">
            <Text className="text-lg font-bold">חלבונים</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setUiView(UI_TYPES.CARBS)}>
          <View className="bg-emerald-300 p-2 rounded">
            <Text className="text-lg font-bold">פחמימות</Text>
          </View>
        </TouchableOpacity>
      </View>
      {dietPlan?.meals.map((meal,i) => (
        <View key={i} style={styles.meal}>
          <Text style={styles.mealTitle}>ארוחה {i+1}</Text>
          <MealContainer  meal={meal}/>
        </View>
      ))}

      <View className="absolute top-16 ">
        {uiView === UI_TYPES.CARBS && <CarbTable setUiState={setUiView} uiStates={UI_TYPES} />}
        {uiView === UI_TYPES.PROTEIN && <ProteinTable setUiState={setUiView} uiStates={UI_TYPES} />}
      </View>
    </ScrollView>
  );

}

 const styles=StyleSheet.create({
    meal:{
      backgroundColor:Colors.darkLight,
      padding:10,
      margin:7,
      borderRadius:10,
      display:`flex`,
    },
    mealTitle:{
      color:Colors.lightDark,
      textAlign:"right",
      fontWeight:"bold",
      paddingRight:10,
      paddingTop:5
    }
  })
