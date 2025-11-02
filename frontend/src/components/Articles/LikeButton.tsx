import { View } from "react-native";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import Icon from "../Icon/Icon";
import { Text } from "../ui/Text";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import useUpdateLikeStatus from "@/hooks/mutations/articles/useUpdateLikeStatus";
import { useMemo } from "react";
import { useUserStore } from "@/store/userStore";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { softHaptic } from "@/utils/haptics";

interface LikeButtonProps {
  articleId: string;
  likes: string[];
  group: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ articleId, likes, group }) => {
  const { flexRow, itemsCenter } = useLayoutStyles();
  const { mutate } = useUpdateLikeStatus(articleId, group);
  const userId = useUserStore((state) => state.currentUser?._id);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const isLiked = useMemo(() => {
    if (!likes.length || !userId) return false;

    return !!likes.find((likeId) => userId == likeId);
  }, [likes.length, userId]);

  const handleLikePress = () => {
    mutate();

    scale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 8 })
    );

    rotation.value = withSequence(
      withSpring(-15, { damping: 6, stiffness: 200 }),
      withSpring(10, { damping: 6, stiffness: 200 }),
      withSpring(0, { damping: 6 })
    );

    softHaptic();
  };

  return (
    <PrimaryButton
      style={isLiked ? { backgroundColor: "#EBFFEF" } : {}}
      block
      mode="light"
      onPress={handleLikePress}
    >
      <View style={[flexRow, itemsCenter, { gap: 2 }]}>
        <Animated.View style={animatedStyle}>
          <Icon name="like" />
        </Animated.View>
        <Text fontSize={16} fontVariant="bold">
          אהבתי
        </Text>
      </View>
    </PrimaryButton>
  );
};

export default LikeButton;
