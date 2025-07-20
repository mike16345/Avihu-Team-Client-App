import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";
import Tabs from "@/components/ui/Tabs";
import ChatBubble from "@/components/ui/chat/ChatBubble";
import SendButton from "@/components/ui/chat/SendButton";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

  const [active1, setActive1] = useState("carbs");
  const [active2, setActive2] = useState("day");
  const [active3, setActive3] = useState("login");

  const tabs1 = [
    { value: "protein", label: "חלבונים" },
    { value: "carbs", label: "פחמימות" },
    { value: "fats", label: "שומנים" },
    { value: "vegetable", label: "ירקות" },
  ];

  const tabs2 = [
    { value: "day", label: "יומי" },
    { value: "week", label: "שבועי" },
    { value: "month", label: "חודשי" },
  ];

  const tabs3 = [
    { value: "login", label: "התחברות" },
    { value: "register", label: "חשבון חדש" },
  ];

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdXl,
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
 רמת הכושר והזמן הפנוי. באופן כללי:
לשיפור כללי או שמירה – 3 עד 4 אימונים בשבוע יכולים להספיק. להרזיה או חיטוב – 4 עד 5 אימונים בשילוב תזונה מתאימה. לבניית מסת שריר – 4 עד 6 אימונים בשבוע, עם חלוקה לפי קבוצות שרירים ומנוחה מסודרת.
הכי חשוב לשמור על עקביות, להקשיב לגוף ולעבוד בצורה שמתאימה לכם. אימון טוב נמדד לא רק בכמות, אלא גם באיכות."
        variant="response"
      />

      <SendButton onPress={() => console.log("pressed")} />

      <Tabs items={tabs1} value={active1} setValue={(val) => setActive1(val)} />
      <Tabs items={tabs2} value={active2} setValue={(val) => setActive2(val)} />
      <Tabs items={tabs3} value={active3} setValue={(val) => setActive3(val)} />

      <Text>active1-{active1}</Text>
      <Text>active2-{active2}</Text>
      <Text>active3-{active3}</Text>
    </View>
  );
};

export default Sandbox;
