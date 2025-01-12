import React from "react";
import { DateRanges } from "../../types/dateTypes";
import WeightCard from "./WeightCard";
import { useUserStore } from "@/store/userStore";

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
  const currentUserPlatType = useUserStore((store) => store.currentUser?.planType);

  const determinePositiveProgression = (isLosingWeight: boolean) => {
    let isProgressPositive;

    if (currentUserPlatType == `חיטוב`) {
      isProgressPositive = isLosingWeight ? true : false;
    } else {
      isProgressPositive = isLosingWeight ? false : true;
    }

    return isProgressPositive;
  };

  const isLosingWeight = lastWeighIn < firstWeighIn;
  const operator = weightLoss == `0.00` ? `` : isLosingWeight ? `-` : `+`;
  const isCutting = currentUserPlatType == "חיטוב";
  const positiveProgress = isCutting ? isLosingWeight : !isLosingWeight;

  return (
    <WeightCard
      title={`מגמה ${rangeToName(range)}`}
      value={firstWeighIn && lastWeighIn ? weightLoss : 0}
      unit='ק"ג'
      operator={operator}
      isProgressing={weightLoss == `0.00` ? undefined : positiveProgress}
    />
  );
};

export default WeeklyScoreCard;
