import { useUserStore } from "@/store/userStore";
import { View } from "react-native";
import UserDetailContainer from "./UserDetailContainer";

const UserInfoContainer = () => {
  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <View>
      <UserDetailContainer
        label="שם מלא"
        value={`${currentUser?.firstName} ${currentUser?.lastName}`}
      />
      <UserDetailContainer label="מייל" value={currentUser?.email || ``} />
      <UserDetailContainer label="טלפון" value={currentUser?.phone || ``} />
      <UserDetailContainer label="סוג תוכנית" value={currentUser?.planType || ``} />
      <UserDetailContainer
        label="תאריך הצטרפות"
        value={new Date(currentUser?.dateJoined || ``).toLocaleDateString()}
      />
      <UserDetailContainer
        label="תאריך סיום"
        value={new Date(currentUser?.dateFinished || ``).toLocaleDateString()}
      />
    </View>
  );
};

export default UserInfoContainer;
