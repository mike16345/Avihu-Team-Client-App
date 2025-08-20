import useStyles from "@/styles/useGlobalStyles";
import { useWindowDimensions, View } from "react-native";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import Input from "../ui/inputs/Input";
import useAddWeighIn from "@/hooks/mutations/useAddWeighIn";
import { useState } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/useToast";

const weighInSchema = z.object({
  weight: z
    .number({
      required_error: "יש להזין מספר",
      invalid_type_error: "הערך חייב להיות מספר",
    })
    .positive("המספר חייב להיות גדול מ-0"),
});

const WeightInput = () => {
  const { layout, spacing } = useStyles();
  const { width } = useWindowDimensions();
  const { triggerErrorToast } = useToast();
  const { mutate, isLoading } = useAddWeighIn();

  const [weighIn, setWeighIn] = useState<string>(""); // keep as string
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    // convert to number only here
    const parsed = Number(weighIn);

    const result = weighInSchema.safeParse({
      weight: parsed,
    });

    if (!result.success) {
      const message = result.error.errors[0]?.message ?? "שגיאה לא ידועה";

      triggerErrorToast({ message });
      setError(message);

      return;
    }

    setError(null);
    mutate(result.data);
    setWeighIn("");
  };

  return (
    <View style={[layout.center, spacing.gapMd]}>
      <View style={[spacing.pdHorizontalLg]}>
        <Input
          value={weighIn}
          error={!!error}
          keyboardType="number-pad"
          style={[{ width: width * 0.75 }]}
          onChangeText={(val) => setWeighIn(val)}
          placeholder="רשמו כאן את המשקל היומי"
        />
      </View>
      <View style={[layout.center]}>
        <PrimaryButton onPress={handleSubmit} loading={isLoading} style={[{ width: width * 0.6 }]}>
          שליחה
        </PrimaryButton>
      </View>
    </View>
  );
};

export default WeightInput;
