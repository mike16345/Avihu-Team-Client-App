import { IUserDetails } from "@/interfaces/User";
import { useUserStore } from "@/store/userStore";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import UserDetailContainer from "./UserDetailContainer";

const userDetailsArray = [
  {
    label: `שם מלא`,
    value: ``,
  },
  {
    label: `כתבות מייל`,
    value: ``,
  },
  {
    label: `מספר פלאפון`,
    value: ``,
  },
  {
    label: `תאריך הצטרפות`,
    value: ``,
  },
  {
    label: `תאריך סיום`,
    value: ``,
  },
  {
    label: `סוג תוכנית`,
    value: ``,
  },
];

const UserInfoContainer = () => {
  const currentUser = useUserStore((state) => state.currentUser);

  const [userDetails, setUserDetails] = useState(userDetailsArray);

  useEffect(() => {
    if (!currentUser) return;

    const { firstName, lastName, email, phone, planType, dateFinished, dateJoined } = currentUser;

    const userArray = [...userDetails];

    setUserDetails(userDetailsArray);
  }, [currentUser]);

  return (
    <View>
      <UserDetailContainer />
    </View>
  );
};

export default UserInfoContainer;
