import { View, Text, FlatList } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import ChatBubble from "../ui/chat/ChatBubble";
import { IChatMessage } from "@/interfaces/chat";
import { ConditionalRender } from "../ui/ConditionalRender";
import Loader from "../ui/loaders/Loader";

interface ConversationContainerProps {
  conversation: IChatMessage[];
  loading: boolean;
}

const ConversationContainer: React.FC<ConversationContainerProps> = ({ conversation, loading }) => {
  const { spacing, layout } = useStyles();

  return (
    <>
      <FlatList
        data={conversation}
        keyExtractor={(item, i) => item.text + i.toString()}
        renderItem={({ item }) => <ChatBubble variant={item.variant}>{item.text}</ChatBubble>}
        inverted
        nestedScrollEnabled
        contentContainerStyle={[spacing.gap20]}
        keyboardShouldPersistTaps="handled"
      />

      <ConditionalRender condition={loading}>
        <ChatBubble variant="response">
          <Loader />
        </ChatBubble>
      </ConditionalRender>
    </>
  );
};

export default ConversationContainer;
