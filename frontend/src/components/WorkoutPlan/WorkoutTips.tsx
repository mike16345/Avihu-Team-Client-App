import { Dimensions, FlatList, Text, View } from "react-native";
import { Dispatch, FC, SetStateAction } from "react";
import NativeIcon from "@/components/Icon/NativeIcon";
import { CustomModal } from "../ui/Modal";
import useStyles from "@/styles/useGlobalStyles";

interface WorkoutTipsProps {
  openTips: boolean;
  tips?: string[];
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
  const { fonts, layout, text, colors, spacing } = useStyles();

  return (
    <CustomModal
      style={[
        layout.center,
        colors.backgroundSurface,
        spacing.pdLg,
        { height: Dimensions.get("screen").height / 2, top: "20%" },
      ]}
      visible={openTips}
      onDismiss={() => setOpenTips(false)}
      dismissableBackButton
    >
      <View
        style={[
          layout.widthFull,
          layout.flexRow,
          layout.itemsCenter,
          layout.justifyBetween,
          spacing.mgVerticalDefault,
        ]}
      >
        <NativeIcon
          onPress={() => setOpenTips(false)}
          library="MaterialCommunityIcons"
          name="close"
          size={22}
          color={colors.textOnSurface.color}
        />
        <Text style={[text.textBold, fonts.lg, colors.textPrimary]}>דגשים לאימון</Text>
      </View>
      <FlatList
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <Text
            style={[
              text.textBold,
              text.textRight,
              fonts.md,
              colors.textOnSurface,
              spacing.mgHorizontalSm,
            ]}
          >
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
