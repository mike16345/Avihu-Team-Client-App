import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Card from "@/components/ui/Card";
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

      <Card body={<Text>white</Text>} />
      <Card body={<Text>grey</Text>} variant="gray" />

      <Card
        body={
          <View style={[{ height: 100 }, colors.backgroundSuccessContainer]}>
            <Text>Act like im an image</Text>
          </View>
        }
        header={<Text>Heading</Text>}
        footer={
          <View style={[layout.flexRow, spacing.gapDefault]}>
            <Icon name="bell" />
            <Icon name="camera" />
          </View>
        }
      />
      <Card
        style={[spacing.gapXxl, colors.backdrop]}
        variant="gray"
        body={
          <View style={[{ height: 100 }, colors.backgroundSuccessContainer]}>
            <Text>Act like im an image</Text>
          </View>
        }
        header={<Text style={{ textAlign: "left" }}>Heading</Text>}
        footer={
          <View style={[layout.flexRow, spacing.gapDefault]}>
            <Icon name="bell" />
            <Icon name="camera" />
          </View>
        }
      />
    </View>
  );
};

export default Sandbox;
