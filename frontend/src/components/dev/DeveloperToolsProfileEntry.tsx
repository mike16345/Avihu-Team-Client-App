import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useDeveloperTools } from "@/devtools/context";

export const DeveloperToolsProfileEntry = () => {
  const { available, openPanel } = useDeveloperTools();

  if (!available) return null;

  return (
    <PrimaryButton
      accessibilityLabel="Open Developer Tools"
      block
      mode="light"
      onPress={openPanel}
      style={{ marginTop: 20 }}
    >
      Developer Tools
    </PrimaryButton>
  );
};
