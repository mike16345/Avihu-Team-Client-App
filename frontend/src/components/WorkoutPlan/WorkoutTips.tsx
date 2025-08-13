import { Dimensions, FlatList, View } from "react-native";
import { Dispatch, FC, SetStateAction } from "react";
import NativeIcon from "@/components/Icon/NativeIcon";
import { CustomModal } from "../ui/modals/Modal";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import BottomDrawer from "../ui/BottomDrawer";

interface WorkoutTipsProps {
  openTips: boolean;
  tips?: string[];
  setOpenTips: Dispatch<SetStateAction<boolean>>;
  title?: String;
}

const generalTips = [
  "כל תחילת אימון הליכה 5 דק לחמם את הגוף",
  "אימון משקולות תמיד יהיה לפני האירובי",
  "בתחילת האימון יש לבצע שני סטים של חימום בתרגיל הראשון",
  "במידה ויש תרגיל שאתם לא מכירים אתם שולחים לי הודעה",
  "מנוחה בין סט לסט 40-60 שניות",
];

const WorkoutTips: FC<WorkoutTipsProps> = ({
  tips = generalTips,
  openTips,
  setOpenTips,
  title = `דגשים לאימון`,
}) => {
  const { fonts, text, colors, spacing } = useStyles();

  return (
    <BottomDrawer heightVariant="auto" open={openTips} onClose={() => setOpenTips(false)}>
      <Text
        style={[text.textRight, fonts.xxl, text.textBold, colors.textPrimary, spacing.pdDefault]}
      >
        {title}
      </Text>
      <FlatList
        keyExtractor={(_, i) => i.toString()}
        style={spacing.pdBottomBar}
        renderItem={({ item, index }) => (
          <Text
            style={[
              text.textBold,
              text.textRight,
              fonts.md,
              colors.textOnSurface,
              spacing.mgHorizontalSm,
              spacing.pdVerticalDefault,
            ]}
          >
            {index + 1 + ". "}
            {item}
          </Text>
        )}
        data={tips}
      />
    </BottomDrawer>
  );
};

export default WorkoutTips;
