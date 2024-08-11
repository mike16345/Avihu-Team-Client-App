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
import NativeIcon from "../Icon/NativeIcon";
import FABGroup from "../ui/FABGroup";
import MenuItemModal from "./MenuItemModal";
import { PaperProvider, Portal } from "react-native-paper";
import { CustomModal } from "../ui/Modal";

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFoodGroup,setSelectedFoodGroup]=useState<string |null>(null)
  const [uiView, setUiView] = useState(UI_TYPES.STANDARD);
  const scrollRef = useRef(null);

  const openModal=(foodGroup:string)=>{
    setIsOpen(true)
    setSelectedFoodGroup(foodGroup)
  }

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


      <View className="flex-row justify-center gap-9 pb-6 z-50">
        <TouchableOpacity onPress={() => openModal(`protein`)}>
          <View className="bg-emerald-300 p-2 rounded ">
            <Text className="text-lg font-bold">חלבונים</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={ () => openModal(`carbs`)}>
          <View className="bg-emerald-300 p-2 rounded">
            <Text className="text-lg font-bold">פחמימות</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {dietPlan?.meals.map((meal,i) => (
        <View key={i} style={styles.meal}>
          <View style={styles.mealIcon}>
            <NativeIcon library="MaterialCommunityIcons" name="food-outline" color={Colors.light} size={20}/>
          <Text style={styles.mealTitle}>ארוחה {i+1}</Text>
          </View>
          <MealContainer  meal={meal}/>
        </View>
      ))}
    
      <MenuItemModal foodGroup={selectedFoodGroup} isOpen={isOpen} dismiss={()=>setIsOpen(false)}/>
      

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
      flexDirection:`row-reverse`,
      alignItems:`center`,
    },
    mealIcon:{
      display:`flex`,
      justifyContent:`center`,
      alignItems:`center`,
      padding:5,
      paddingLeft:10,
      borderLeftColor:Colors.light,
      borderLeftWidth:2,
      gap:5
    },
    mealTitle:{
      color:Colors.light,
      fontWeight:"bold",
    }
  })
