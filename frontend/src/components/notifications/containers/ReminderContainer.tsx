import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import useStyles from "@/styles/useGlobalStyles";
import Icon from "@/components/Icon/Icon";

interface ReminderContainerProps {
  type: "weighIn" | "measurement";
  handleDismiss: () => void;
}

const ReminderContainer: React.FC<ReminderContainerProps> = ({ type, handleDismiss }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <Card style={[common.roundedMd, layout.widthFull, layout.itemsStart, spacing.pdMd]}>
      <Card.Content style={[layout.flexRow, layout.itemsStart, { gap: 10 }]}>
        <Icon name="info" height={20} width={20} />
        <View style={[layout.flex1, layout.itemsStart]}>
          <Text fontSize={16} fontVariant="semibold" style={{ paddingBottom: 4 }}>
            מתזכרים אותך לעדכן {type == "measurement" ? "היקפים" : "שקילה יומית"}
          </Text>
          <Text fontSize={14} fontVariant="regular" style={{ color: "grey" }}>
            כדי שנוכל להיות במעקב חשוב
          </Text>
          <Text fontSize={14} fontVariant="regular" style={{ paddingBottom: 12, color: "grey" }}>
            למלא את הפרטים
          </Text>

          <View style={[layout.flexRow, layout.justifyStart, { gap: 12 }]}>
            <TouchableOpacity>
              <Text fontSize={14} fontVariant="semibold">
                למעבר לחץ כאן
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDismiss}>
              <Text fontSize={14} fontVariant="semibold" style={{ color: "grey" }}>
                התעלם
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleDismiss}>
          <Icon name="closeSoft" height={20} width={20} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

export default ReminderContainer;
