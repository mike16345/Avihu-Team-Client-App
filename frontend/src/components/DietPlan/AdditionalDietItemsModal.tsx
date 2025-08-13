import { FC, useState } from "react";
import { CustomModal } from "../ui/Modal";
import useStyles from "@/styles/useGlobalStyles";
import { View } from "react-native";
import { Text } from "../ui/Text";
import useFoodGroupQuery from "@/hooks/queries/useMenuItemsQuery";
import { FoodGroup } from "@/types/foodTypes";
import { formatServingText } from "@/utils/utils";
import SecondaryButton from "../ui/buttons/SecondaryButton";

interface AdditionalDietItemsModalProps {
  foodGroup: FoodGroup;
  name: string;
}

const AdditionalDietItemsModal: FC<AdditionalDietItemsModalProps> = ({ name, foodGroup }) => {
  const { colors, layout, common, spacing } = useStyles();
  const { data = [] } = useFoodGroupQuery(foodGroup);

  const [isOpen, setIsOpen] = useState(false);

  const onDismiss = () => {
    setIsOpen(false);
  };

  return (
    <>
      <SecondaryButton onPress={() => setIsOpen(true)} rightIcon="info">
        <Text fontVariant="semibold">הצגת תחליף לארוחה ב{name}</Text>
      </SecondaryButton>
      <CustomModal visible={isOpen} onDismiss={onDismiss}>
        <CustomModal.Header dismissIcon="chevronRightBig">
          <View
            style={[
              colors.backgroundSurface,
              common.borderXsm,
              colors.outline,
              layout.center,
              spacing.gapDefault,
              common.rounded,
              layout.flex1,
              { height: 35 },
            ]}
          >
            <Text fontVariant="semibold">{name}</Text>
          </View>
        </CustomModal.Header>
        <CustomModal.Content>
          {data.map((item, i) => {
            return (
              <Text key={item?._id || i} fontVariant="semibold">
                {formatServingText(item.name, item.oneServing)}
              </Text>
            );
          })}
        </CustomModal.Content>
      </CustomModal>
    </>
  );
};

export default AdditionalDietItemsModal;
