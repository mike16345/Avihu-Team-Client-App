import { View } from "react-native";
import { useEffect } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { RouteProp } from "@react-navigation/native";
import { SectionStackParamList } from "../DynamicForm";
import FormSectionHeader from "./FormSectionHeader";
import FormSectionFooter from "./FormSectionFooter";
import FormSectionContent from "./FormSectionContent";
import { useFormContext } from "@/context/useFormContext";
import { useFormStore } from "@/store/formStore";

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
    initialSectionIndex,
    progress,
    updateFormProgress,
    didInitStackRef,
  } = useFormContext();

  const { sectionIndex } = route.params;
  const section = sections[sectionIndex];
  const lastSectionIndex = Math.max(sections.length - 1, 0);
  const isLast = sectionIndex === lastSectionIndex;

  useEffect(() => {
    if (!didInitStackRef.current && initialSectionIndex > 0 && !navigation.canGoBack()) {
      const routes = Array.from({ length: initialSectionIndex + 1 }, (_, index) => ({
        name: "FormSection",
        params: { sectionIndex: index },
      }));

      navigation.reset({
        index: initialSectionIndex,
        routes,
      });

      didInitStackRef.current = true;
      return;
    }

    didInitStackRef.current = true;

    if (progress?.currentSectionIndex !== sectionIndex) {
      updateFormProgress(formId, {
        currentSectionIndex: sectionIndex,
        currentSectionId: section?._id,
      });
    }
  }, [sectionIndex]);

  const goNext = () => {
    if (hasInvalidOptionsInSection(sectionIndex) || !validateSection(sectionIndex)) return;

    if (!isLast) {
      navigation.push("FormSection", { sectionIndex: sectionIndex + 1 });
      updateFormStoreProgress(formId, {
        previousSectionId: section._id,
        previousSectionIndex: sectionIndex,
      });
    }
  };

  return (
    <View style={[layout.flex1, spacing.pdStatusBar, spacing.pdBottomBar]}>
      <FormSectionHeader
        currentSection={sectionIndex + 1}
        totalSections={sections.length}
        sectionTitle={section.title}
        sectionDescription={section.description}
      />

      <FormSectionContent currentSection={section} />

      <FormSectionFooter
        goBack={() => navigation.push("FormSection", { sectionIndex: sectionIndex - 1 })}
        goNext={goNext}
        handleSubmit={handleSubmit}
        isLast={isLast}
        sectionIndex={sectionIndex}
        isLoading={isPending}
      />
    </View>
  );
};

export default FormSectionScreen;
