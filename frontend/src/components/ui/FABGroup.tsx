import { FC } from "react";
import { FAB, Portal } from "react-native-paper";
import { Props } from "react-native-paper/src/components/FAB/FabGroup";

interface FABGroupProps extends Props {}

const FABGroup: FC<FABGroupProps> = ({ ...props }) => {
  return (
    <Portal>
      <FAB.Group {...props} />
    </Portal>
  );
};

export default FABGroup;