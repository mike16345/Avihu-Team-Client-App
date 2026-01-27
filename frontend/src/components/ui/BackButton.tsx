import { BackHandler, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "../Icon/Icon";
import { IconName } from "@/constants/iconMap";

interface BackButtonProps<T extends ParamListBase> {
  backIcon?: IconName;
}

const BackButton = <T extends ParamListBase>({
  backIcon = "chevronRightBig",
}: BackButtonProps<T>) => {
  const navigation = useNavigation<NativeStackNavigationProp<T>>();

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
