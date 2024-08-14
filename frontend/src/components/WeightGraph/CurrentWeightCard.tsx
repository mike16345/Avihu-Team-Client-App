import React from "react";
import WeightCard from "./WeightCard";

interface CurrentWeightCardProps {
  currentWeight: number;
}

const CurrentWeightCard: React.FC<CurrentWeightCardProps> = ({ currentWeight }) => {
  return <WeightCard title="משקל נוכחי" value={currentWeight} unit='ק"ג' />;
};

export default CurrentWeightCard;
