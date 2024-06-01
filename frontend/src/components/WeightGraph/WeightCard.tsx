import { StyleSheet, Text, View } from "react-native";
import React from "react";

interface WeightCardProps {
  currentWeight: number;
}

const WeightCard: React.FC<WeightCardProps> = ({ currentWeight }) => {
  return (
    <View style={styles.card}>
      <Text className="text-white font-bold text-right ">משקל נוכחי</Text>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 3 }}>
        <Text className="text-white text-2xl  font-bold">{currentWeight}</Text>
        <Text style={{ color: "white", fontSize: 12 }} className="text-white">
          ק"ג
        </Text>
      </View>
    </View>
  );
};

export default WeightCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 2,
    borderRadius: 16,
    padding: 20,
    height: "100%",
    backgroundColor: "#18181b",
  },
});
