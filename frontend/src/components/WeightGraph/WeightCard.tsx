import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import { Card } from "../ui/Card";
import { useWindowDimensions } from "react-native";

interface CardProps {
  title: string;
  value: string | number;
  unit: string;
  operator?: string;
  isProgressing?: boolean;
}

const WeightCard: React.FC<CardProps> = ({ title, value, unit, operator = "" }) => {
  const { layout, spacing } = useStyles();
  const cardWidth = useWindowDimensions().width * 0.4;

  return (
    <Card
      variant="white"
      style={[
        spacing.pdHorizontalMd,
        spacing.pdVerticalDefault,
        {
          width: cardWidth,
          backgroundColor: "#FFFFFF",
          borderColor: "rgba(7, 39, 35, 0.08)",
          borderWidth: 1,
          borderRadius: 18,
        },
      ]}
      shadow={false}
    >
      <Card.Header>
        <Text style={[layout.alignSelfStart]} fontSize={16}>
          {title}
        </Text>
      </Card.Header>

      <Card.Content style={[layout.flexRow, spacing.gapSm]}>
        <Text fontVariant="semibold" fontSize={24}>
          {operator}
          {value || 0}
        </Text>
        <Text fontVariant="semibold" fontSize={24}>
          {unit}
        </Text>
      </Card.Content>
    </Card>
  );
};

export default WeightCard;
