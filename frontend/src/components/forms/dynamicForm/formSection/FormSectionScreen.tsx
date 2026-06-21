import { BackHandler, Platform, View } from "react-native";
import { useCallback, useEffect } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { SectionStackParamList } from "../DynamicForm";
import FormSectionHeader from "./FormSectionHeader";
import FormSectionFooter from "./FormSectionFooter";
import FormSectionContent from "./FormSectionContent";
import { useFormContext } from "@/context/useFormContext";
import { useFormStore } from "@/store/formStore";
import CustomScrollView from "@/components/ui/scrollview/CustomScrollView";
import { SectionTransitionDirection } from "../DynamicForm";

const FormSectionScreen = ({
  route,
  navigation,
}: {
  route: RouteProp<SectionStackParamList, "FormSection">;
  navigation: any;
}) => {
  const { spacing, layout } = useStyles();
  const { updateFormProgress: updateFormStoreProgress } = useFormStore();
  const {
    sections,
    handleSubmit,
    isPending,
    validateSection,
    hasInvalidOptionsInSection,
    formId,
    progress,
    updateFormProgress,
  } = useFormContext();

  const { sectionIndex } = route.params;
  const section = sections[sectionIndex];
  const lastSectionIndex = Math.max(sections.length - 1, 0);
  const isLast = sectionIndex === lastSectionIndex;

  useEffect(() => {
    if (progress?.currentSectionIndex !== sectionIndex) {
      updateFormProgress(formId, {
        currentSectionIndex: sectionIndex,
        currentSectionId: section?._id,
      });
    }
  }, [sectionIndex]);

  const goToSection = (nextSectionIndex: number, direction: SectionTransitionDirection) => {
    updateFormStoreProgress(formId, {
      previousSectionId: section._id,
      previousSectionIndex: sectionIndex,
      currentSectionId: sections[nextSectionIndex]?._id,
      currentSectionIndex: nextSectionIndex,
    });

    navigation.replace("FormSection", {
      sectionIndex: nextSectionIndex,
      direction,
    });
  };

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;

      const handler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (sectionIndex > 0) {
          goToSection(sectionIndex - 1, "backward");
          return true;
        }

        return true;
      });

      return () => {
        handler.remove();
      };
    }, [sectionIndex])
  );

  const goNext = () => {
    if (hasInvalidOptionsInSection(sectionIndex) || !validateSection(sectionIndex)) return;

    if (!isLast) {
      goToSection(sectionIndex + 1, "forward");
    }
  };

  const submitForm = async () => {
    if (isPending) return;
    if (hasInvalidOptionsInSection(sectionIndex) || !validateSection(sectionIndex)) return;

    await handleSubmit();
  };

  return (
    <View style={[layout.flex1, spacing.pdStatusBar, spacing.pdBottomBar]}>
      <CustomScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[spacing.pdVerticalMd, spacing.gapXl]}
        nestedScrollEnabled
        topShadowFirstColor="#F2F2F2"
        bottomShadowFirstColor="#F2F2F2"
      >
        <FormSectionHeader
          currentSection={sectionIndex + 1}
          totalSections={sections.length}
          sectionTitle={section.title}
          sectionDescription={section.description}
        />

        <FormSectionContent currentSection={section} />
      </CustomScrollView>

      <FormSectionFooter
        goBack={() => goToSection(sectionIndex - 1, "backward")}
        goNext={goNext}
        handleSubmit={submitForm}
        isLast={isLast}
        sectionIndex={sectionIndex}
        isLoading={isPending}
      />
    </View>
  );
};

export default FormSectionScreen;
