import React from "react";
import { DateRanges } from "../../types/dateTypes";
import useStyles from "@/styles/useGlobalStyles";
import WeightCard from "./WeightCard";

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

  const { colors } = useStyles();
  const isImproving = lastWeighIn < firstWeighIn;
  const weightStyle = isImproving ? colors.textSuccess : colors.textDanger;

  return (
    <WeightCard
      title={`מגמה ${rangeToName(range)}`}
      value={weightLoss}
      unit='ק"ג'
      valueStyle={weightStyle}
    />
  );
};

export default WeeklyScoreCard;
