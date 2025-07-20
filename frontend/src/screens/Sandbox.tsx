import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import useExerciseMethodApi from "@/hooks/api/useExerciseMethodsApi";
import { useState } from "react";
import AsyncToastWrapper from "@/components/ui/AsyncToastWrapper";
import ChatBubble from "@/components/ui/chat/ChatBubble";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdDefault,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
        { direction: "rtl" },
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>
      <ChatBubble text="היי, אני אכלתי אוכל היי, אני אכלתי אוכל היי, אני אכלתי אוכל" />
      <ChatBubble
        text="בשמחה, הנה הגרסה המעודכנת והמתונה – ללא אייקונים:
מספר האימונים המומלץ בשבוע תלוי במטרה האישית שלכם,
 רמת הכושר והזמן הפנוי.  באופן כללי:
לשיפור כללי או שמירה – 3 עד 4 אימונים בשבוע יכולים להספיק.  להרזיה או חיטוב – 4 עד 5 אימונים בשילוב תזונה מתאימה.  לבניית מסת שריר – 4 עד 6 אימונים בשבוע, עם חלוקה לפי קבוצות שרירים ומנוחה מסודרת.
הכי חשוב לשמור על עקביות, להקשיב לגוף ולעבוד בצורה שמתאימה לכם.  אימון טוב נמדד לא רק בכמות, אלא גם באיכות."
        variant="response"
      />
    </View>
  );
};

export default Sandbox;
