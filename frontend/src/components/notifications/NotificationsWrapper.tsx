import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useMemo, useState } from "react";
import Icon from "../Icon/Icon";
import NotificationModal from "./NotificationModal";
import { useNotificationStore } from "@/store/notificationStore";
import { ConditionalRender } from "../ui/ConditionalRender";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";

const NotificationsWrapper = () => {
  const { getDeliveredNotifications, notifications: allNotifications } = useNotificationStore();
  const { layout, common } = useStyles();

  const [openNavigationModal, setOpenNavigationModal] = useState(false);

  const notifications = useMemo(() => getDeliveredNotifications(), [allNotifications]);

  return (
    <>
      <TouchableOpacity
        style={{ position: "relative" }}
        onPress={() => setOpenNavigationModal(true)}
      >
        <Icon name="bell" height={30} width={30} />

        <ConditionalRender condition={!!notifications.length}>
          <View style={[layout.center, common.roundedFull, styles.notificationBadge]}>
            <Text fontVariant="bold">{notifications.length}</Text>
          </View>
        </ConditionalRender>
      </TouchableOpacity>

      <NotificationModal
        notifications={notifications}
        visible={openNavigationModal}
        onDismiss={() => setOpenNavigationModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  notificationBadge: {
    backgroundColor: "#95FDA8",
    position: "absolute",
    paddingHorizontal: 5,
    top: -5,
  },
});

export default NotificationsWrapper;
