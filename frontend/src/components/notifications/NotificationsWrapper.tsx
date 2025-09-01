import { TouchableOpacity } from "react-native";
import { useState } from "react";
import Icon from "../Icon/Icon";
import NotificationModal from "./NotificationModal";

const NotificationsWrapper = () => {
  const [openNavigationModal, setOpenNavigationModal] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={{ position: "relative" }}
        onPress={() => setOpenNavigationModal(true)}
      >
        <Icon name="bell" height={30} width={30} />

        {/*   <View style={[layout.center, common.roundedFull, styles.notificationBadge]}>
               <Text fontVariant="bold">2</Text>
             </View> */}
        {/* Uncomment when logic for notifications is built */}
      </TouchableOpacity>

      <NotificationModal
        notifications={[]}
        visible={openNavigationModal}
        onDismiss={() => setOpenNavigationModal(false)}
      />
    </>
  );
};

/* const styles = StyleSheet.create({
  notificationBadge: {
    backgroundColor: "#95FDA8",
    position: "absolute",
    paddingHorizontal: 5,
    top: -5,
  },
}); */
/* Uncomment when logic for notifications is built */

export default NotificationsWrapper;
