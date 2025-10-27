import { View } from "react-native";
import Icon from "../Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import { IconName } from "@/constants/iconMap";

interface ArticleMetricProps {
  value: number;
  icon: IconName;
}

const ArticleMetric: React.FC<ArticleMetricProps> = ({ icon, value }) => {
  const { layout } = useStyles();

  return (
    <View style={[layout.flexRow, layout.itemsCenter, { gap: 6 }]}>
      <Icon name={icon} />
      <Text fontSize={16} fontVariant="semibold">
        {value}
      </Text>
    </View>
  );
};

export default ArticleMetric;
