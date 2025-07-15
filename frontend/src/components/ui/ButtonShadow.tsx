import { View } from "react-native";
import { useShadowStyles } from "@/styles/useShadowStyles";
import { ConditionalRender } from "./ConditionalRender";

interface buttonShadowProps {
  children: any;
  shadow?: boolean;
}

const ButtonShadow: React.FC<buttonShadowProps> = ({ children, shadow = true }) => {
  const { buttonLayer1, buttonLayer2, buttonLayer3, buttonLayer4, buttonLayer5 } =
    useShadowStyles();

  return (
    <>
      <ConditionalRender condition={shadow}>
        <View style={[buttonLayer1]}>
          <View style={buttonLayer2}>
            <View style={buttonLayer3}>
              <View style={buttonLayer4}>
                <View style={buttonLayer5}>{children}</View>
              </View>
            </View>
          </View>
        </View>
      </ConditionalRender>

      <ConditionalRender condition={!shadow} children={children} />
    </>
  );
};

export default ButtonShadow;
