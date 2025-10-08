import { View } from "react-native";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import Icon from "../Icon/Icon";
import { Text } from "../ui/Text";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import useUpdateLikeStatus from "@/hooks/mutations/articles/useUpdateLikeStatus";
import { useMemo } from "react";
import { useUserStore } from "@/store/userStore";

interface LikeButtonProps {
  articleId: string;
  likes: string[];
  group: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ articleId, likes, group }) => {
  const { flexRow, itemsCenter } = useLayoutStyles();
  const { mutate, isPending } = useUpdateLikeStatus(articleId, group);
  const userId = useUserStore((state) => state.currentUser?._id);

  const isLiked = useMemo(() => {
    if (!likes.length || !userId) return false;

    return !!likes.find((likeId) => userId == likeId);
  }, [likes.length, userId]);

  const handleLikePress = () => {
    mutate();
  };

  return (
    <PrimaryButton
      style={isLiked ? { backgroundColor: "#EBFFEF" } : {}}
      block
      mode="light"
      loading={isPending}
      onPress={handleLikePress}
    >
      <View style={[flexRow, itemsCenter, { gap: 2 }]}>
        <Icon name="like" />
        <Text fontSize={16} fontVariant="bold">
          אהבתי
        </Text>
      </View>
    </PrimaryButton>
  );
};

export default LikeButton;
