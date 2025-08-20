import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import { Card } from "../ui/Card";

interface CardProps {
  title: string;
  value: string | number;
  unit: string;
  operator?: string;
  isProgressing?: boolean;
}

const WeightCard: React.FC<CardProps> = ({ title, value, unit }) => {
  const { layout, spacing } = useStyles();

  return (
    <Card
      variant="gray"
      style={[spacing.pdHorizontalMd, spacing.pdVerticalDefault, { width: 153.5 }]}
    >
      <Card.Header>
        <Text fontSize={16}>{title}</Text>
      </Card.Header>

      <Card.Content style={[layout.flexRow, spacing.gapSm]}>
        <Text fontVariant="semibold" fontSize={24}>
          +{value || 0}
        </Text>
        <Text fontVariant="semibold" fontSize={24}>
          {unit}
        </Text>
      </Card.Content>
    </Card>
  );
};

export default WeightCard;
