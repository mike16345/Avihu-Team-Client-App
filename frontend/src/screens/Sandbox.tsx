import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Card } from "@/components/ui/Card";
import Icon from "@/components/Icon/Icon";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdXl,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
        { direction: "rtl" },
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>

      <Card>
        <Card.Content>
          <Text>white</Text>
        </Card.Content>
      </Card>

      <Card variant="gray">
        <Card.Content>
          <Text>grey</Text>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Text>Heading</Text>
        </Card.Header>

        <Card.Content>
          <View style={[{ height: 100 }, colors.backgroundSuccessContainer]}>
            <Text>Act like im an image</Text>
          </View>
        </Card.Content>

        <Card.Footer>
          <View style={[layout.flexRow, spacing.gapDefault]}>
            <Icon name="bell" />
            <Icon name="camera" />
          </View>
        </Card.Footer>
      </Card>

      <Card style={[colors.backgroundError, spacing.gapXxl]}>
        <Card.Header>
          <Text style={{ textAlign: "left" }}>Heading</Text>
        </Card.Header>

        <Card.Content>
          <View style={[{ height: 100 }, colors.backgroundSuccessContainer]}>
            <Text>Act like im an image</Text>
          </View>
        </Card.Content>

        <Card.Footer style={[colors.backdrop]}>
          <Icon name="bell" />
          <Icon name="camera" />
        </Card.Footer>
      </Card>
    </View>
  );
};

export default Sandbox;
