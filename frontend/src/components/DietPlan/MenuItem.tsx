import { Colors } from '@/constants/Colors'
import { IMenuItem } from '@/interfaces/DietPlan'
import useFontSize from '@/styles/useFontSize'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface MenuItemProps{
    menuItem:IMenuItem
}

const MenuItem:React.FC<MenuItemProps> = ({menuItem}) => {

    const {xsm}= useFontSize()

  return (
    <View style={styles.menuItemContainer}>
        <View style={styles.divider}>
        <Text style={styles.menuItemName}>{menuItem.name}</Text>
        </View>
        <View style={styles.servingContainer}>
            <Text style={[styles.servingItemText,xsm]}>גרם: {menuItem.oneServing.grams}</Text>
            <View style={styles.servingDivider}></View>
            <Text style={[styles.servingItemText, xsm]}>כפות: {menuItem.oneServing.spoons}</Text>
        </View>
    </View>
  )
}

const styles=StyleSheet.create({
    menuItemContainer:{
        display:`flex`,
        alignItems:`center`,
        padding:5,
        gap:2,
    },
    menuItemName:{
        color:Colors.light,
        textAlign:`right`
    },
    servingContainer:{
        display:`flex`,
        flexDirection:`row`,
        justifyContent:`space-between`,
        gap:3,
        padding:5
    },
    servingItemText:{
        color:Colors.light
    },
    borderLeft:{
        borderLeftColor:Colors.light,
        borderLeftWidth:4
    },
    divider:{
        borderBottomColor:Colors.primary,
        borderBottomWidth:1,
        width:`100%`,
        padding:2
    },
    servingDivider:{
        width:1,
        backgroundColor:Colors.primary
    }

})

export default MenuItem
