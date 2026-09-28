import React from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "./Text";

interface PlanPendingStateProps {
  buttonLabel?: string;
  description?: string;
  isFetching?: boolean;
  onRefresh?: () => void;
  title: string;
}

const PlanPendingState: React.FC<PlanPendingStateProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F8F9FA",
  },
  title: {
    color: "#0F172A",
    textAlign: "center",
  },
});

export default PlanPendingState;
