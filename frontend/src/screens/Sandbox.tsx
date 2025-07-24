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

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState("1");

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
      <SecondaryButton
        children="היסטוררית דיווחים"
        leftIcon="like"
        rightIcon="arrowLeft"
        onPress={() => setVisible(true)}
      />
      <IconButton icon="arrowRoundRightSmall" />
      <SendButton onPress={() => console.log("pressed")} />
      <ProgressBar maxValue={100} value={20} />
      <Input placeholder="type" />
      <ChatInput placeholder="type me" />
      <ChatBubble
        text="kaka djcjk ckjndjcn cndsjkndsj dcjkndcjnds jnjkdcndscnjkds cjnsdjkcnsd"
        variant="prompt"
      />
      <ChatBubble
        text="kaka djcjk ckjndjcn cndsjkndsj dcjkndcjnds jnjkdcndscnjkds cjnsdjkcnsd"
        variant="response"
      />
      <AsyncToastWrapper onPress={() => console.log("success")}>
        <PrimaryButton children={"hello"} block disabled />
      </AsyncToastWrapper>

      <Tabs
        items={[
          { label: `1`, value: "1" },
          { label: `2`, value: "2" },
          { label: `3`, value: "3" },
        ]}
        value={tab}
        setValue={(v) => setTab(v)}
      />

      <CustomModal visible={visible} onDismiss={() => setVisible(false)}>
        <CustomModal.Header dismissIcon="chevronRightBig">
          <View
            style={[
              colors.backgroundSurface,
              common.borderXsm,
              colors.outline,
              layout.center,
              spacing.gapDefault,
              common.rounded,
              layout.flex1,
              { height: 35 },
            ]}
          >
            <Text>חלבונים</Text>
          </View>
        </CustomModal.Header>

        <CustomModal.Content>
          <ScrollView contentContainerStyle={spacing.gapDefault}>
            {Array.from({ length: 50 }).map((_, i) => (
              <Text key={i}>I am index number {i}</Text>
            ))}
          </ScrollView>
        </CustomModal.Content>
      </CustomModal>
    </View>
  );
};

export default Sandbox;
