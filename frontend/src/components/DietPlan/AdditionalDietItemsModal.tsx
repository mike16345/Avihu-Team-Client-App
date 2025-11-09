import { FC, useState } from "react";
import { CustomModal } from "../ui/modals/Modal";
import useStyles from "@/styles/useGlobalStyles";
import { ScrollView, View } from "react-native";
import { Text } from "../ui/Text";
import useFoodGroupQuery from "@/hooks/queries/MenuItems/useFoodGroupQuery";
import { FoodGroup } from "@/types/foodTypes";
import { formatServingText } from "@/utils/utils";
import SecondaryButton from "../ui/buttons/SecondaryButton";
import { ConditionalRender } from "../ui/ConditionalRender";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { Card } from "../ui/Card";

interface AdditionalDietItemsModalProps {
  foodGroup: FoodGroup;
  name: string;
  servingSize: number;
}

const AdditionalDietItemsModal: FC<AdditionalDietItemsModalProps> = ({
  name,
  foodGroup,
  servingSize,
}) => {
  const { colors, layout, common, spacing } = useStyles();
  const { data = [], isLoading } = useFoodGroupQuery(foodGroup);

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
        <Card variant="gray">
          <ConditionalRender condition={isLoading}>
            <View style={[layout.center]}>
              <SpinningIcon mode="light" />
            </View>
          </ConditionalRender>
          <ScrollView
            nestedScrollEnabled
            contentContainerStyle={[spacing.gapMd, { alignSelf: "stretch" }]}
          >
            {data.map((item, i) => {
              return (
                <Text key={item?._id || i} style={[layout.alignSelfStart]} fontVariant="semibold">
                  {formatServingText(item.name, item.oneServing, servingSize)}
                </Text>
              );
            })}
          </ScrollView>
        </Card>
      </CustomModal>
    </>
  );
};

export default AdditionalDietItemsModal;
