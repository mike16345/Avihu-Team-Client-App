import { Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, View } from "react-native";
import { useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import ChatInput from "@/components/ui/inputs/ChatInput";
import SendButton from "@/components/ui/chat/SendButton";
import { Text } from "@/components/ui/Text";
import InitialChatContainer from "@/components/chat/InitialChatContainer";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import ConversationContainer from "@/components/chat/ConversationContainer";
import { IChatMessage } from "@/interfaces/chat";

const ChatScreen = () => {
  const { colors, layout, spacing, text } = useStyles();

  const [chatInitiated, setChatInitiated] = useState(false);
  const [conversation, setConversation] = useState<IChatMessage[]>([]);
  const [prompt, setPrompt] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt) return;

    setChatInitiated(true);
    setConversation((prev) => [{ text: prompt, variant: "prompt" }, ...prev]);
    setPrompt(undefined);

    setTimeout(() => {
      setLoading(true);

      // Simulate server response after additional 2.5s (total 3s)
      setTimeout(() => {
        setLoading(false);
        setConversation((prev) => [{ text: "תשובה לדוגמא מהצאט", variant: "response" }, ...prev]);
      }, 2500);
    }, 500);
  };

  return (
    <KeyboardAvoidingView style={layout.flex1} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[spacing.pdXl, layout.flex1, spacing.gap20]}>
          <Text fontVariant="light" fontSize={14} style={text.textCenter}>
            תשובות כלליות בלבד, פנו למאמן להכוונה מדויקת
          </Text>

          <ConditionalRender condition={!chatInitiated}>
            <InitialChatContainer />
          </ConditionalRender>
          <ConditionalRender condition={chatInitiated}>
            <ConversationContainer conversation={conversation} loading={loading} />
          </ConditionalRender>

          <View style={[layout.flexRow, spacing.gapDefault]}>
            <ChatInput
              style={[colors.backgroundSurface, layout.flex1]}
              placeholder="כתבו כאן"
              onChangeText={(val) => setPrompt(val)}
              value={prompt}
            />

            <SendButton disabled={!prompt} onPress={handleSend} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
