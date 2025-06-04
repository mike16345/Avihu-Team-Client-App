import {
    ImpactFeedbackStyle,
    NotificationFeedbackType,
    impactAsync,
    notificationAsync,
    selectionAsync
} from "expo-haptics";

const {Heavy,Light,Medium,Rigid,Soft}=ImpactFeedbackStyle;
const {Error,Success,Warning}=NotificationFeedbackType

export const successNotificationHapit=()=>notificationAsync(Success);

export const errorNotificationHaptic=()=>notificationAsync(Error)

export const warningNotificationHaptic=()=>notificationAsync(Warning)

export const selectionHaptic=()=>selectionAsync()

export const softHaptic=()=>impactAsync(Soft)

export const rigidHaptic=()=>impactAsync(Rigid)

export const lightHaptic=()=>impactAsync(Light)

export const mediumHaptic=()=>impactAsync(Medium)

export const heavyHaptic=()=>impactAsync(Heavy)