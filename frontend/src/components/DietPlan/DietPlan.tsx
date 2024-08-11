import { View, ImageBackground, ScrollView,  Text, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import logoBlack from "../../../assets/images/avihu-logo-black.png";
import useHideTabBarOnScroll from "@/hooks/useHideTabBarOnScroll";
import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { useUserStore } from "@/store/userStore";
import { IDietPlan } from "@/interfaces/DietPlan";
import MealContainer from "./MealContainer";
import { Colors } from "@/constants/Colors";
import NativeIcon from "../Icon/NativeIcon";
import FABGroup from "../ui/FABGroup";
import MenuItemModal from "./MenuItemModal";


export default function DietPlan() {
  

  const { handleScroll } = useHideTabBarOnScroll();
  const currentUser = useUserStore((state) => state.currentUser);
  const {getDietPlanByUserId}=useDietPlanApi()

  const [dietPlan,setDietPlan]=useState<IDietPlan|null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFabOpen,setIsFabOpen]=useState(false)
  const [selectedFoodGroup,setSelectedFoodGroup]=useState<string |null>(null)
  const scrollRef = useRef(null);

  const openModal=(foodGroup:string)=>{
    setIsModalOpen(true)
    setIsFabOpen(false)
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

      {dietPlan?.meals.map((meal,i) => (
        <View key={i} style={styles.meal}>
          <View style={styles.mealIcon}>
            <NativeIcon library="MaterialCommunityIcons" name="food-outline" color={Colors.light} size={20}/>
          <Text style={styles.mealTitle}>ארוחה {i+1}</Text>
          </View>
          <MealContainer  meal={meal}/>
        </View>
      ))}
    
      <MenuItemModal foodGroup={selectedFoodGroup} isOpen={isModalOpen} dismiss={()=>setIsModalOpen(false)}/>
      <FABGroup
        style={{bottom:100}}
        open={isFabOpen}
        visible
        icon={isFabOpen?`close`:`food-outline`}
        label="פריטים"
        actions={[
          {
              icon: 'fish',
              label: 'חלבונים',
              onPress: () => openModal(`protein`),
            },
            {
              icon: 'baguette',
              label: 'פחמימות',
              onPress: () => openModal(`carbs`),
            },
            {
              icon: 'cheese',
              label: 'שומנים',
              onPress: () => openModal(`fats`),
            },
            {
            icon:`leaf`,
            label:`ירקות`,
            onPress:()=> openModal(`vegetables`)   
          }
        ]}
        onStateChange={()=>setIsFabOpen(!isFabOpen)}
      />

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
