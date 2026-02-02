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

const FormSectionScreen = ({
  route,
  navigation,
}: {
  route: RouteProp<SectionStackParamList, "FormSection">;
  navigation: any;
}) => {
  const { spacing, layout, colors } = useStyles();
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

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;

      const handler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (sectionIndex === initialSectionIndex) {
          return true; // Prevent back when loading
        }
        return false; // Allow back when not loading
      });

      return () => {
        handler.remove();
      };
    }, [sectionIndex, initialSectionIndex]) // Re-register handler when isLoading changes
  );

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

  const submitForm = () => {
    if (hasInvalidOptionsInSection(sectionIndex) || !validateSection(sectionIndex)) return;

    handleSubmit();
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
        goBack={() => navigation.push("FormSection", { sectionIndex: sectionIndex - 1 })}
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
