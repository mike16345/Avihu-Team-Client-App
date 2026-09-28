import { FC } from "react";
import {
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "../ui/Text";
import {
  BlockBackgroundStatus,
  IBlockBackground,
  IWorkoutBlock,
  WorkoutBlockStatus,
} from "@/interfaces/Workout";

interface BlocksStripProps {
  blocks: IWorkoutBlock[];
  activeBlockIndex: number;
  selectedBlockIndex: number;
  onSelectBlock: (index: number) => void;
  backgrounds?: IBlockBackground[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

const STATUS_LABELS: Record<WorkoutBlockStatus, string> = {
  "low-intensity": "עצימות נמוכה",
  "moderate-intensity": "עצימות בינונית",
  "high-intensity": "עצימות גבוהה",
  peak: "שיא",
  deload: "דילואוד",
};

const resolveBackgroundUrl = (
  status: WorkoutBlockStatus | undefined,
  backgrounds?: IBlockBackground[]
): string | undefined => {
  if (!backgrounds || backgrounds.length === 0) return undefined;
  const key: BlockBackgroundStatus = status ?? "normal";
  return backgrounds.find((bg) => bg.status === key)?.url;
};

const BlocksStrip: FC<BlocksStripProps> = ({
  blocks,
  activeBlockIndex,
  selectedBlockIndex,
  onSelectBlock,
  backgrounds,
  onRefresh,
  refreshing,
}) => {
  if (!blocks || blocks.length === 0) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {blocks.map((block, index) => {
        const isSelected = index === selectedBlockIndex;
        const isActive = index === activeBlockIndex;
        const statusLabel = block.status ? STATUS_LABELS[block.status] : undefined;
        const bgUrl = resolveBackgroundUrl(block.status, backgrounds);
        const cardStyle = [
          styles.card,
          isSelected && styles.cardSelected,
          !isSelected && isActive && styles.cardActive,
        ];
        const renderInner = () => (
          <View style={styles.cornerBadge}>
            <Text
              fontSize={12}
              fontVariant="semibold"
              style={bgUrl ? styles.cornerTextOnImage : styles.cornerText}
            >
              בלוק {index + 1}
              {statusLabel ? ` — ${statusLabel}` : ""}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </View>
        );
        return (
          <Pressable
            key={block.id ?? `block-${index}`}
            onPress={() => onSelectBlock(index)}
            style={cardStyle}
          >
            {bgUrl ? (
              <ImageBackground
                source={{ uri: bgUrl }}
                resizeMode="cover"
                style={styles.imageBg}
                imageStyle={styles.imageInner}
              >
                <View style={styles.overlay} />
                {renderInner()}
              </ImageBackground>
            ) : (
              renderInner()
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  card: {
    minHeight: 160,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    padding: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardActive: {
    borderColor: "#FFFFFF",
  },
  cardSelected: {
    backgroundColor: "#F8FAFC",
    borderColor: "#FFFFFF",
  },
  imageBg: {
    flex: 1,
    minHeight: 136,
    margin: -12,
    padding: 12,
    justifyContent: "flex-start",
  },
  imageInner: {
    borderRadius: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,39,35,0.45)",
  },
  cornerBadge: {
    position: "absolute",
    top: 10,
    left: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  cornerText: {
    color: "#475569",
  },
  cornerTextOnImage: {
    color: "#FFFFFF",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
});

export default BlocksStrip;
