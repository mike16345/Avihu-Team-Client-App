import { useState } from "react";
import { StyleSheet } from "react-native";

type Direction = "rtl" | "ltr";

const useDirection = () => {
  const [preferredDirection, setPreferredDirection] = useState<Direction>("rtl");

  const direction = StyleSheet.create({
    direction: { direction: preferredDirection },
  });

  return { preferredDirection, setPreferredDirection, direction };
};

export default useDirection;
