import { Pressable, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { CustomModal } from "@/components/ui/modals/Modal";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import { FC, useState } from "react";
import { useTimerStore } from "@/store/timerStore";
import TriggerWrapper, { TriggerProps } from "@/components/ui/TriggerWrapper";

interface RestTimerProps {
  trigger: TriggerProps;
}

const RestTimer: FC<RestTimerProps> = ({ trigger }) => {
  const { layout } = useStyles();
  const { countdown } = useTimerStore();

  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <TriggerWrapper trigger={trigger} setOpen={() => setIsVisible(true)} />

      <CustomModal visible={isVisible} style={[layout.flex1]}>
        <View style={[layout.flex1, layout.center]}>
          <Text fontSize={100} fontVariant="brutalist">
            {countdown}
          </Text>
        </View>
        <View style={[layout.itemsCenter, layout.justifyEnd]}>
          <Pressable onPress={() => setIsVisible(false)}>
            <Icon name="close" height={40} width={40} />
          </Pressable>
        </View>
      </CustomModal>
    </>
  );
};

export default RestTimer;
