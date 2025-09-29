import { BackHandler, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { IArticleCount } from "@/interfaces/IArticle";
import Icon from "../Icon/Icon";
import { Text } from "../ui/Text";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArticleStackParamsList } from "@/types/navigatorTypes";

interface ArticleGroupHeaderProps {
  articleGroup: IArticleCount;
}

const ArticleGroupHeader: React.FC<ArticleGroupHeaderProps> = ({ articleGroup }) => {
  const { layout, spacing, text } = useStyles();

  const navigation = useNavigation<NativeStackNavigationProp<ArticleStackParamsList>>();

  const handleReturn = () => {
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleReturn);

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={spacing.gapMd}>
      <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
        <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
          <TouchableOpacity onPress={handleReturn}>
            <Icon name="chevronRightBig" />
          </TouchableOpacity>
          <Text fontSize={20} fontVariant="light">
            {articleGroup.name}
          </Text>
        </View>

        <Text fontSize={14} fontVariant="bold">
          {articleGroup.count} מאמרים
        </Text>
      </View>

      <Text fontSize={16} fontVariant="regular" style={text.textLeft}>
        {articleGroup.description}
      </Text>
    </View>
  );
};

export default ArticleGroupHeader;
