import { FlatList, StyleSheet, Text, View } from "react-native";
import { Dispatch, FC, SetStateAction } from "react";
import { Dialog } from "react-native-elements";
import { Colors } from "@/constants/Colors";
import NativeIcon from "@/components/Icon/NativeIcon";

interface WorkoutTipsProps {
  openTips: boolean;
  setOpenTips: Dispatch<SetStateAction<boolean>>;
}

const tips = [
  "כל תחילת אימון הליכה 5 דק לחמם את הגוף",
  "אימון משקולות תמיד יהיה לפני האירובי",
  "בתחילת האימון יש לבצע שני סטים של חימום בתרגיל הראשון",
  "במידה ויש תרגיל שאתם לא מכירים אתם שולחים לי הודעה",
  "מנוחה בין סט לסט 40-60 שניות",
];

const WorkoutTips: FC<WorkoutTipsProps> = ({ openTips, setOpenTips }) => {
  return (
    <Dialog
      animationType="slide"
      overlayStyle={styles.centeredView}
      isVisible={openTips}
      onRequestClose={() => setOpenTips(false)}
    >
      <View className="flex-row justify-between items-center mb-4">
        <NativeIcon
          onPress={() => setOpenTips(false)}
          library="MaterialCommunityIcons"
          name="close"
          size={22}
          color={"white"}
        />
        <Text style={styles.title}>דגשים לאימון</Text>
      </View>
      <FlatList
        renderItem={({ item, index, separators }) => (
          <Text style={styles.tip}>
            {index + 1 + ". "}
            {item}
          </Text>
        )}
        data={tips}
      />
    </Dialog>
  );
};

export default WorkoutTips;

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: Colors.dark,
  },

  title: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "600",
  },
  tip: {
    color: Colors.light,
    paddingBottom: 10,
    fontWeight: "600",
  },
});
