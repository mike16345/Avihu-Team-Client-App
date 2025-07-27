import React from "react";

export type TriggerProps =
  | React.ReactElement // Component like <TouchableOpacity />
  | ((props: { onPress: () => void }) => React.ReactNode); // Render function

interface Props {
  trigger: TriggerProps;
  setOpen: (value: boolean) => void;
}

const TriggerWrapper: React.FC<Props> = ({ trigger, setOpen }) => {
  const handlePress = () => {
    console.log("Setting open to true");
    setOpen(true);
  };

  // Case 1: trigger is a render function
  if (typeof trigger === "function") {
    return <>{trigger({ onPress: handlePress })}</>;
  }

  // Case 2: trigger is a valid React element
  if (React.isValidElement(trigger)) {
    // If the component supports onPress (e.g. TouchableOpacity or custom), inject it
    return React.cloneElement(trigger, {
      onPress: handlePress,
      ...trigger.props,
    });
  }

  // Fallback if trigger is invalid
  console.warn("Invalid trigger provided to TriggerWrapper.");
  return null;
};
export default TriggerWrapper;
