import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import GreenDotGenerator from "../ui/GreenDotGenerator";
import { Text } from "../ui/Text";
import { IDietItem } from "@/interfaces/DietPlan";
import FoodItemSelection from "./FoodItemSelection";
import { foodGroupToApiFoodGroupName } from "@/utils/utils";
import { FoodGroup } from "@/types/foodTypes";
import AdditionalDietItemsModal from "./AdditionalDietItemsModal";

interface DietItemContentProps {
  name: string;
  dietItem: IDietItem;
}

const DietItemContent: React.FC<DietItemContentProps> = ({ name, dietItem }) => {
  const { layout, spacing } = useStyles();

  const apiFoodGroup = foodGroupToApiFoodGroupName(name) as FoodGroup;

  return (
    <>
      <View style={[spacing.gapDefault]}>
        <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
          <Text fontVariant="bold">{name}</Text>
          <GreenDotGenerator count={dietItem.quantity} />
        </View>
        <View style={{ minHeight: 45 }}>
          <FoodItemSelection foodGroup={apiFoodGroup} servingAmount={dietItem.quantity} />
        </View>

        <AdditionalDietItemsModal name={name} foodGroup={apiFoodGroup} />
      </View>
    </>
  );
};

export default DietItemContent;
