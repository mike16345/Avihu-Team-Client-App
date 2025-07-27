import { View, Text, ScrollView } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";
import { CustomModal } from "@/components/ui/Modal";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Tabs from "@/components/ui/Tabs";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import IconButton from "@/components/ui/buttons/IconButton";
import SendButton from "@/components/ui/chat/SendButton";
import ProgressBar from "@/components/ui/ProgressBar";
import Input from "@/components/ui/Input";
import ChatInput from "@/components/ui/chat/ChatInput";
import ChatBubble from "@/components/ui/chat/ChatBubble";
import AsyncToastWrapper from "@/components/ui/AsyncToastWrapper";
import BottomDrawer from "@/components/ui/BottomDrawer";
import UploadDrawer from "@/components/ui/UploadDrawer";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

  const [visible, setVisible] = useState(false);

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdXl,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>
      <PrimaryButton children="Open Modal" icon="like" block onPress={() => setVisible(true)} />

      <UploadDrawer open={visible} onClose={() => setVisible(false)} />
    </View>
  );
};

export default Sandbox;
