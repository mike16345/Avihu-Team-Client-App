import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import SecondaryButton from "../ui/buttons/SecondaryButton";
import GreenDotGenerator from "../ui/GreenDotGenerator";
import { Text } from "../ui/Text";
import { IDietItem } from "@/interfaces/DietPlan";
import FoodItemSelection from "./FoodItemSelection";
import { foodGroupToApiFoodGroupName } from "@/utils/utils";
import { FoodGroup } from "@/types/foodTypes";

interface DietItemContentProps {
  name: string;
  dietItem: IDietItem;
}

const DietItemContent: React.FC<DietItemContentProps> = ({ name, dietItem }) => {
  const { layout, spacing } = useStyles();

  return (
    <View style={[spacing.gapDefault]}>
      <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
        <Text fontVariant="bold">{name}</Text>
        <GreenDotGenerator count={dietItem.quantity} />
      </View>
      <View style={[{ height: 40 }]}>
        <FoodItemSelection foodGroup={foodGroupToApiFoodGroupName(name) as FoodGroup} />
      </View>

      <SecondaryButton onPress={() => console.log("name", name)} rightIcon="info">
        <Text fontVariant="semibold">הצגת תחליף לארוחה ב{name}</Text>
      </SecondaryButton>
    </View>
  );
};

export default DietItemContent;
