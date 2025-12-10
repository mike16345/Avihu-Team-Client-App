import Icon from "@/components/Icon/Icon";
import IconButton from "@/components/ui/buttons/IconButton";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import TipsModal from "@/components/ui/modals/TipsModal";
import { IExercise } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";
import { useNavigation } from "@react-navigation/native";
import { FC, useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import RestTimer from "./RestTimer";
import { useTimerStore } from "@/store/timerStore";
import { Text } from "@/components/ui/Text";
import { isHtmlEmpty } from "@/utils/utils";
import useExerciseMethodQuery from "@/hooks/queries/useExerciseMethodQuery";
import { CustomModal } from "@/components/ui/modals/Modal";
import HtmlBlock from "@/components/ui/HTMLBlock";

const buttonsPadding = { paddingHorizontal: 14, paddingVertical: 8 };

interface RecordExerciseHeaderProps {
  exercise: IExercise;
}

const RecordExerciseHeader: FC<RecordExerciseHeaderProps> = ({ exercise }) => {
  const { layout } = useStyles();
  const { goBack } = useNavigation();
  const countdown = useTimerStore((state) => state.countdown);
  const { data: exerciseMethod, isLoading } = useExerciseMethodQuery(
    exercise.exerciseMethod || null
  );

  const [tips, setTips] = useState<string[]>([]);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [isExerciseMethodModalOpen, setisExerciseMethodModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [isHTML, setIsHTML] = useState(false);

  const handleOpenExerciseMethodModal = () => {
    if (!exerciseMethod) return;

    setisExerciseMethodModalOpen(true);
  };

  const handleOpenModal = (tips: string[], title: string) => {
    setTips(tips);
    setModalTitle(title);
    setIsTipsModalOpen(true);
  };

  const handleDismissModal = () => {
    setTips([]);
    setModalTitle("");
    setIsTipsModalOpen(false);
    setIsHTML(false);
  };

  useEffect(() => handleDismissModal, []);

  return (
    <>
      <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween, { paddingTop: 12 }]}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="chevronRightBig" />
        </TouchableOpacity>
        <View style={[layout.flexRow, layout.itemsCenter, { gap: 6 }]}>
          <ConditionalRender condition={!!countdown}>
            <RestTimer
              trigger={
                <IconButton
                  style={[buttonsPadding, { backgroundColor: "#ECFDF3" }]}
                  icon={"clock"}
                  size={20}
                  label={
                    <Text fontVariant="semibold" fontSize={14}>
                      {countdown}
                    </Text>
                  }
                />
              }
            />
          </ConditionalRender>
          <ConditionalRender condition={!!exercise.exerciseMethod}>
            <SecondaryButton
              onPress={() => handleOpenExerciseMethodModal()}
              style={buttonsPadding}
              rightIcon="info"
              disabled={isLoading}
            >
              שיטת אימון
            </SecondaryButton>
          </ConditionalRender>
          <ConditionalRender condition={!isHtmlEmpty(exercise.exerciseId.tipFromTrainer)}>
            <SecondaryButton
              onPress={() => {
                handleOpenModal([exercise.exerciseId.tipFromTrainer || ""], "דגשים");
                setIsHTML(true);
              }}
              style={buttonsPadding}
              rightIcon="info"
            >
              דגשים
            </SecondaryButton>
          </ConditionalRender>
        </View>
      </View>

      <TipsModal
        title={modalTitle}
        onDismiss={handleDismissModal}
        visible={isTipsModalOpen}
        tips={tips}
        useHtmlRenderer={isHTML}
      />

      <CustomModal
        visible={isExerciseMethodModalOpen}
        onDismiss={() => setisExerciseMethodModalOpen(false)}
      >
        <CustomModal.Header>שיטת אימון</CustomModal.Header>
        <CustomModal.Content style={{ gap: 16 }}>
          <Text fontVariant="bold" fontSize={16} style={{ textAlign: "left" }}>
            {exerciseMethod?.data.title}
          </Text>

          <HtmlBlock source={{ html: exerciseMethod?.data.description || "" }} />
        </CustomModal.Content>
      </CustomModal>
    </>
  );
};

export default RecordExerciseHeader;
