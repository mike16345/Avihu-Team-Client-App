import useColors from "@/styles/useColors";
import { View } from "react-native";

interface GreenDotProps {
  size?: number;
  filled?: number;
}

const GreenDot: React.FC<GreenDotProps> = ({ size = 8, filled = 1 }) => {
  const { backgroundSuccess } = useColors();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "transparent",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: backgroundSuccess.backgroundColor,
      }}
    >
      <View
        style={{
          width: size * filled,
          height: size,
          ...backgroundSuccess,
        }}
      />
    </View>
  );
};

export default GreenDot;
