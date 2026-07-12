import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "@/types/navigatorTypes";

export const CARDIO_DEEP_LINK = "avihuteam://cardio?openCardio=true";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["avihuteam://"],
  config: {
    screens: {
      BottomTabs: {
        screens: {
          MyWorkoutPlanPage: {
            path: "cardio",
            screens: {
              WorkoutPlan: "",
            },
          },
        },
      },
    },
  },
};
