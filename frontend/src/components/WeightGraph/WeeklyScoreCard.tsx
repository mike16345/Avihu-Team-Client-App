import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { IWeighIn } from "../../interfaces/User";
import { Colors } from "../../constants/Colors";
import { DateRanges } from "../../types/dateTypes";

const rangeToName = (range: DateRanges) => {
  switch (range) {
    case "weeks":
      return "שבועית";
    case "months":
      return "חודשית";
    case "years":
      return "שנתית";
    default:
      return "";
  }
};
interface WeeklyScoreCardProps {
  weights: number[];
  range: DateRanges;
}
const WeeklyScoreCard: React.FC<WeeklyScoreCardProps> = ({ weights, range }) => {
  const firstWeighIn = weights[0];
  const lastWeighIn = weights[weights.length - 1];
  const weightLoss = Math.abs(lastWeighIn - firstWeighIn).toFixed(2);

  const [isImproving, setIsImproving] = useState(lastWeighIn < firstWeighIn);

  return (
    <View style={styles.card}>
      <Text className="text-white font-bold text-right ">מגמה {rangeToName(range)} </Text>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 3 }}>
        <Text
          style={{ color: isImproving ? Colors.success : Colors.danger }}
          className="text-white text-2xl  font-bold"
        >
          {weightLoss}
        </Text>
        <Text style={{ color: "white", fontSize: 12, opacity: 50 }}>ק"ג</Text>
      </View>
    </View>
  );
};

export default WeeklyScoreCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 2,
    borderRadius: 16,
    padding: 20,
    height: "100%",
    backgroundColor: "#18181b",
  },
  weeklyWeightStatus: {
    fontWeight: 600,
  },
});
