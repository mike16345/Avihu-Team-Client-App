import { Colors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CustomModal } from '../ui/Modal';
import useFontSize from '@/styles/useFontSize';
import useMenuItemApi from '@/hooks/useMenuItemApi';
import { IMenuItem } from '@/interfaces/DietPlan';
import MenuItem from './MenuItem';

interface MenuItemModalProps{
    isOpen:boolean,
    foodGroup:string|null
    dismiss:()=>void
}

const MenuItemModal:React.FC<MenuItemModalProps> = ({isOpen, foodGroup, dismiss}) => {
    const {xl}=useFontSize();
    const {getMenuItems}=useMenuItemApi()

 const [visible, setVisible] = useState(false);
 const [items,setItems]=useState<IMenuItem[]>([])

 useEffect(()=>{
    if (foodGroup) {
       getMenuItems(foodGroup)
       .then(res=>setItems(res))
       .catch(err=>console.log(err))
    }
 },[foodGroup])

  
  return (
     <CustomModal
        visible={isOpen}
        dismissable
        onDismiss={dismiss}
     >
        <ScrollView style={styles.modal}>
        <View >
            <Text style={[styles.modalHeader,xl]}>
                {foodGroup ===`protein`?`חלבונים`:
                foodGroup ===`carbs`? `פחמימות` :
                foodGroup ===`vegetables`? `ירקות`:
                `שומנים`
            }
            </Text>
            <View style={styles.menuItemContainer}>
                {items.map(item=>(
                    <View key={item.name} style={{maxWidth:`30%`}}>
                        <MenuItem menuItem={item}/>
                    </View>
                ))}
            </View>
        </View>
        </ScrollView>
     </CustomModal>
  )
}

const styles=StyleSheet.create({
    modal:{
        height:`80%`,
        backgroundColor:Colors.bgSecondary,
        padding:10,
        borderRadius:20,
        borderColor:Colors.primary,
        borderWidth:2,
    },
    modalHeader:{
        color:Colors.primary,
        textAlign:`center`,
        fontWeight:`bold`,
        padding:10,
    },
    menuItemContainer:{
        display:`flex`,
        flexDirection:`row-reverse`,
        justifyContent:`space-around`,
        gap:10,
        flexWrap:`wrap`,
    },
   

})

export default MenuItemModal
