import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { Dispatch, FC, SetStateAction } from "react";
import { Colors } from "@/constants/Colors";
import NativeIcon from "@/components/Icon/NativeIcon";
import { CustomModal } from "../ui/Modal";

interface WorkoutTipsProps {
  openTips: boolean;
  tips: string[];
  setOpenTips: Dispatch<SetStateAction<boolean>>;
}

const generalTips = [
  "כל תחילת אימון הליכה 5 דק לחמם את הגוף",
  "אימון משקולות תמיד יהיה לפני האירובי",
  "בתחילת האימון יש לבצע שני סטים של חימום בתרגיל הראשון",
  "במידה ויש תרגיל שאתם לא מכירים אתם שולחים לי הודעה",
  "מנוחה בין סט לסט 40-60 שניות",
];

const WorkoutTips: FC<WorkoutTipsProps> = ({ tips = generalTips, openTips, setOpenTips }) => {
  return (
    <CustomModal
      style={styles.centeredView}
      visible={openTips}
      onDismiss={() => setOpenTips(false)}
      dismissableBackButton
    >
      <View style={styles.icon}>
        <NativeIcon
          onPress={() => setOpenTips(false)}
          library="MaterialCommunityIcons"
          name="close"
          size={22}
          color={"white"}
        />
      </View>
      <Text style={styles.title}>דגשים לאימון</Text>
      <FlatList
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <Text style={styles.tip}>
            {index + 1 + ". "}
            {item}
          </Text>
        )}
        data={tips}
      />
    </CustomModal>
  );
};

export default WorkoutTips;

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: Colors.darkLight,
    height: "40%",
    top: "20%",
    padding: 12,
    borderRadius: 20,
  },
  icon: {
    display: "flex",
    alignItems: "flex-end",
    paddingBottom: 20,
    paddingRight: 10,
  },
  title: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "right",
    paddingVertical: 15,
  },
  tip: {
    ...Platform.select({
      ios: {
        textAlign: "right",
      },
    }),
    color: Colors.light,
    paddingBottom: 10,
    fontWeight: "600",
  },
});
