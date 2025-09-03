import { View } from "react-native";
import UserDetailContainer from "./UserDetailContainer";
import { useUserStore } from "@/store/userStore";
import { useSpacingStyles } from "@/styles/useSpacingStyles";

const UserDetailsWrapper = () => {
  const { currentUser } = useUserStore();
  const { gapMd } = useSpacingStyles();

  return (
    <View style={gapMd}>
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

export default UserDetailsWrapper;
