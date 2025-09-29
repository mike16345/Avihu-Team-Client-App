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

const buttonsPadding = { paddingHorizontal: 14, paddingVertical: 8 };

interface RecordExerciseHeaderProps {
  exercise: IExercise;
}

const RecordExerciseHeader: FC<RecordExerciseHeaderProps> = ({ exercise }) => {
  const { layout } = useStyles();
  const { goBack } = useNavigation();

  const [tips, setTips] = useState<string[]>([]);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  const handleOpenModal = (tips: string[], title: string) => {
    setTips(tips);
    setModalTitle(title);
    setIsTipsModalOpen(true);
  };

  const handleDismissModal = () => {
    setTips([]);
    setModalTitle("");
    setIsTipsModalOpen(false);
  };

  useEffect(() => handleDismissModal, []);

  return (
    <>
      <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween, { paddingTop: 12 }]}>
        <TouchableOpacity onPress={goBack}>
          <Icon name="chevronRightBig" />
        </TouchableOpacity>
        <View style={[layout.flexRow, layout.itemsCenter, { gap: 6 }]}>
          <ConditionalRender condition={false}>
            <IconButton style={buttonsPadding} icon={"clock"} size={20} />
          </ConditionalRender>
          <ConditionalRender condition={!!exercise.exerciseMethod}>
            <SecondaryButton
              onPress={() => handleOpenModal([exercise.exerciseMethod || ""], "שיטת אימון")}
              style={buttonsPadding}
              rightIcon="info"
            >
              שיטת אימון
            </SecondaryButton>
          </ConditionalRender>
          <ConditionalRender condition={!!exercise.tipFromTrainer}>
            <SecondaryButton
              onPress={() => handleOpenModal([exercise.tipFromTrainer || ""], "דגשים")}
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
      />
    </>
  );
};

export default RecordExerciseHeader;
