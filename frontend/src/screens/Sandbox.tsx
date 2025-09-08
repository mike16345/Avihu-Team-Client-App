import { SafeAreaView, StyleSheet, View } from "react-native";

import useStyles from "@/styles/useGlobalStyles";
import ChatScreen from "./ChatScreen";

export default function Sandbox() {
  const { layout, spacing } = useStyles();

  return (
    <SafeAreaView style={styles.safeView}>
      <ChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
  },
});
