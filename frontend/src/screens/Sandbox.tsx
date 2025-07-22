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
        <Card.content>
          <Text>white</Text>
        </Card.content>
      </Card>

      <Card variant="gray">
        <Card.content>
          <Text>grey</Text>
        </Card.content>
      </Card>

      <Card>
        <Card.header>
          <Text>Heading</Text>
        </Card.header>

        <Card.content>
          <View style={[{ height: 100 }, colors.backgroundSuccessContainer]}>
            <Text>Act like im an image</Text>
          </View>
        </Card.content>

        <Card.footer>
          <View style={[layout.flexRow, spacing.gapDefault]}>
            <Icon name="bell" />
            <Icon name="camera" />
          </View>
        </Card.footer>
      </Card>

      <Card style={[colors.backgroundError, spacing.gapXxl]}>
        <Card.header>
          <Text style={{ textAlign: "left" }}>Heading</Text>
        </Card.header>

        <Card.content>
          <View style={[{ height: 100 }, colors.backgroundSuccessContainer]}>
            <Text>Act like im an image</Text>
          </View>
        </Card.content>

        <Card.footer>
          <View style={[layout.flexRow, spacing.gapDefault]}>
            <Icon name="bell" />
            <Icon name="camera" />
          </View>
        </Card.footer>
      </Card>
    </View>
  );
};

export default Sandbox;
