import { BackHandler, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "../Icon/Icon";
import { IconName } from "@/constants/iconMap";

interface BackButtonProps {
  backIcon?: IconName;
}

const BackButton = ({ backIcon = "chevronRightBig" }: BackButtonProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const goBack = () => {
    navigation.goBack();

    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", goBack);

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <TouchableOpacity onPress={goBack}>
      <Icon name={backIcon} />
    </TouchableOpacity>
  );
};

export default BackButton;
