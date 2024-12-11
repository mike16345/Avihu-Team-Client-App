import React from "react";
import { DateRanges } from "../../types/dateTypes";
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
  const lastWeighIn = weights[weights?.length - 1];
  const weightLoss = Math.abs(lastWeighIn - firstWeighIn).toFixed(2);

  const isLosingWeight = lastWeighIn < firstWeighIn;
  const operator = weightLoss == `0.00` ? `` : isLosingWeight ? `-` : `+`;

  return (
    <WeightCard
      title={`מגמה ${rangeToName(range)}`}
      value={firstWeighIn && lastWeighIn ? weightLoss : 0}
      unit='ק"ג'
      operator={operator}
    />
  );
};

export default WeeklyScoreCard;
