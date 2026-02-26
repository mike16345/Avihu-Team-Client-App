import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  Platform,
  BackHandler,
} from "react-native";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";
import useStyles from "@/styles/useGlobalStyles";
import { useFormContext } from "@/context/useFormContext";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useCurrentAgreementStore } from "@/store/agreementStore";
import { useAgreementApi } from "@/hooks/api/useAgreementApi";
import { ISignedAgreement } from "@/interfaces/IFormResponse";
import { useUserStore } from "@/store/userStore";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useToast } from "@/hooks/useToast";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";
import { useFormStore } from "@/store/formStore";
import { useQueryClient } from "@tanstack/react-query";
import { USER_KEY } from "@/constants/reactQuery";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import AppIcon from "@/components/Icon/AppIcon";
import ButtonShadow from "@/components/ui/buttons/ButtonShadow";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const AgreementSignatureScreen = () => {
  const ref = useRef<SignatureViewRef>(null);
  const { answers } = useFormContext(); // Using FormProvider from parent, so context is available
  const { spacing, layout } = useStyles();
  const { currentAgreement, setCurrentAgreement } = useCurrentAgreementStore();
  const { sendSignedAgreement } = useAgreementApi();
  const navigation = useNavigation<any>();
  const { triggerErrorToast } = useToast();
  const { currentUser, setCurrentUser } = useUserStore();
  const { markAgreementSigned } = useFormStore();
  const queryClient = useQueryClient();
  const userId = currentUser?._id!;
  const { width } = useWindowDimensions();

  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const arrowShift = useSharedValue(0);

  const handleOK = (sig: string) => {
    setSignature(sig);
  };

  const handleClear = () => {
    ref.current?.clearSignature();
    setSignature(null);
  };

  const handleEnd = () => {
    ref.current?.readSignature();
  };

  const handleAgreeAndContinue = async () => {
    if (!signature) {
      console.log("Please provide a signature.");
      return;
    }

    const mappedAnswers = Object.entries(answers).map(([key, value]) => ({
      questionId: key,
      value: value,
    }));

    const submissionPayload: ISignedAgreement = {
      agreementId: currentAgreement?.agreementId!,
      agreementVersion: currentAgreement?.version!,
      answers: mappedAnswers as any,
      signaturePngBase64: signature,
      userId,
    };

    try {
      setIsLoading(true);
      await sendSignedAgreement(submissionPayload);
      markAgreementSigned(userId);
      queryClient.invalidateQueries({ queryKey: [USER_KEY, userId] });

      setCurrentUser({
        ...currentUser!,
        signedAgreement: true,
      });
      setCurrentAgreement(null);
      navigation.replace("AgreementSigned");
    } catch (error: any) {
      triggerErrorToast({ message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    arrowShift.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 700, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const webStyle = `
  .m-signature-pad {
    box-shadow: none; 
    border: 1px solid #DDE8F8;
    height: ${200}px;
    width: ${width - 80}px;
    border-radius:16px;
    margin: 0 auto;
    background-color:#F7FBFF;
  }
  .m-signature-pad--body {
    border: 1px solid #E9F0FA;
    border-radius:16px;
  }
  .m-signature-pad--footer {
    display: none;
    height:0
  }
  `;

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;

      const handler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (isLoading) {
          return true; // Prevent back when loading
        }
        return false; // Allow back when not loading
      });

      return () => {
        handler.remove();
      };
    }, [isLoading]) // Re-register handler when isLoading changes
  );

  return (
    <View style={[styles.container, spacing.pdStatusBar]}>
      <View style={[layout.center, spacing.gapXl, spacing.pdVertical20]}>
        <ButtonShadow>
          <AppIcon />
        </ButtonShadow>
        <View style={[layout.center]}>
          <Text fontVariant="bold" fontSize={24}>
            כל מה שנשאר זה השלב האחרון
          </Text>
          <Text fontSize={24}>לאשר את ההסכם ומתחילים!</Text>
        </View>
      </View>

      <View style={[styles.signHintContainer, spacing.pdHorizontalMd]}>
        <View style={styles.signHintBubble}>
          <Text fontSize={16}>לחתום כאן למטה 👇</Text>
        </View>
      </View>

      <ConditionalRender condition={!isLoading}>
        <SignatureScreen
          ref={ref}
          onOK={handleOK}
          webStyle={webStyle}
          onEnd={handleEnd}
          penColor={"#000"}
          imageType="image/png"
          trimWhitespace
        />
      </ConditionalRender>
      <ConditionalRender condition={isLoading}>
        <View style={[layout.flex1, layout.center, spacing.gapDefault]}>
          <Icon name="upload" height={30} width={30} />
          <Text fontVariant="bold" fontSize={18}>
            שומרים את ההסכם שלך
          </Text>
          <Text>התהליך עשוי לקחת מספר שניות...</Text>
          <SpinningIcon mode="light" />
        </View>
      </ConditionalRender>

      <View style={[spacing.pdHorizontalMd, spacing.pdLg, styles.buttonContainer]}>
        <View style={styles.row}>
          <PrimaryButton
            mode="light"
            onPress={handleClear}
            style={styles.flex}
            disabled={isLoading}
          >
            נקה
          </PrimaryButton>
          <PrimaryButton
            onPress={handleAgreeAndContinue}
            style={styles.flex}
            disabled={!signature || isLoading}
          >
            חתימה ושליחה
          </PrimaryButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    gap: 12,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    margin: 20,
  },
  sigContainer: {
    height: Dimensions.get("window").height - 0.6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  flex: {
    flex: 1,
    marginHorizontal: 5,
  },
  buttonContainer: {
    paddingBottom: 30,
  },
  signHintContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signHintBubble: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signHintIconWrap: {
    backgroundColor: "white",
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AgreementSignatureScreen;
