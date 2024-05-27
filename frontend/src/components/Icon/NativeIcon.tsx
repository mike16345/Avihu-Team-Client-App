import React from "react";
import AntDesignIcons from "react-native-vector-icons/AntDesign";
import EntypoIcons from "react-native-vector-icons/Entypo";
import EvilIconsIcons from "react-native-vector-icons/EvilIcons";
import FeatherIcons from "react-native-vector-icons/Feather";
import FontAwesomeIcons from "react-native-vector-icons/FontAwesome";
import FontAwesome5Icons from "react-native-vector-icons/FontAwesome5";
import FontAwesome5ProIcons from "react-native-vector-icons/FontAwesome5Pro";
import FontAwesome6Icons from "react-native-vector-icons/FontAwesome6";
import FontAwesome6ProIcons from "react-native-vector-icons/FontAwesome6";
import FontistoIcons from "react-native-vector-icons/Fontisto";
import FoundationIcons from "react-native-vector-icons/Foundation";
import IoniconsIcons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import OcticonsIcons from "react-native-vector-icons/Octicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import ZocialIcons from "react-native-vector-icons/Zocial";
import { IconLibrary, IconNames } from "../../types/iconTypes";
import { IconProps } from "react-native-vector-icons/Icon";

interface CustomIconProps<T extends IconLibrary> extends IconProps {
  library: T;
  name: IconNames<T>;
}

const iconComponents = {
  AntDesign: AntDesignIcons,
  Entypo: EntypoIcons,
  EvilIcons: EvilIconsIcons,
  Feather: FeatherIcons,
  FontAwesome: FontAwesomeIcons,
  FontAwesome5: FontAwesome5Icons,
  FontAwesome5Pro: FontAwesome5ProIcons,
  FontAwesome6: FontAwesome6Icons,
  FontAwesome6Pro: FontAwesome6ProIcons,
  Fontisto: FontistoIcons,
  Foundation: FoundationIcons,
  Ionicons: IoniconsIcons,
  MaterialCommunityIcons: MaterialCommunityIcons,
  MaterialIcons: MaterialIcons,
  Octicons: OcticonsIcons,
  SimpleLineIcons: SimpleLineIcons,
  Zocial: ZocialIcons,
};

function NativeIcon<T extends IconLibrary>({ library, name, ...props }: CustomIconProps<T>) {
  const Icon = iconComponents[library];

  return <Icon name={name} {...props} />;
}

export default NativeIcon;
