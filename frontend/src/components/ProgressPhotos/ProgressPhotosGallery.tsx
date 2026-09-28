import { Image, Pressable, StyleSheet, View } from "react-native";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";
import useUserImageUrlsQuery from "@/hooks/queries/ProgressPhotos/useUserImageUrlsQuery";
import { buildPhotoUrl } from "@/utils/utils";
import PhotoCycleModal from "./PhotoCycleModal";
import ReplaceCycleButton from "./ReplaceCycleButton";
import { groupPhotos, isWithinLastWeek } from "./utils";

const ProgressPhotosGallery = () => {
  const { layout, spacing, text, colors } = useStyles();
  const { data: photos = [], isLoading } = useUserImageUrlsQuery();
  const groups = useMemo(() => groupPhotos(photos as string[]), [photos]);
  const [activeGroup, setActiveGroup] = useState<{
    cycleNumber: number;
    initialIndex: number;
  } | null>(null);

  const openViewer = (cycleNumber: number, initialIndex: number) =>
    setActiveGroup({ cycleNumber, initialIndex });
  const closeViewer = () => setActiveGroup(null);
  const openedGroup = groups.find((g) => g.cycleNumber === activeGroup?.cycleNumber);

  if (isLoading) {
    return (
      <View style={[layout.itemsCenter, spacing.pdVerticalLg]}>
        <Text fontVariant="light">טוען מחזורים…</Text>
      </View>
    );
  }

  if (!groups.length) {
    return (
      <View style={[layout.itemsCenter, spacing.pdVerticalLg]}>
        <Text fontVariant="light" style={text.textCenter}>
          עוד לא הועלו תמונות התקדמות
        </Text>
      </View>
    );
  }

  return (
    <View style={[spacing.gapLg]}>
      {groups.map((group) => (
        <Card key={group.cycleNumber} variant="gray" shadow={false} style={styles.card}>
          <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
            <Text fontVariant="bold" fontSize={15}>
              מחזור {group.cycleNumber}
            </Text>
            <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
              {isWithinLastWeek(group.uploadDate) &&
                group.photos.every((slot) => !!slot.url) && (
                  <ReplaceCycleButton
                    cycleNumber={group.cycleNumber}
                    oldUrls={group.photos.map((slot) => slot.url!) as string[]}
                  />
                )}
              {group.uploadDate && (
                <Text fontSize={12} fontVariant="light">
                  {group.uploadDate}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.grid}>
            {group.photos.map((slot, index) => (
              <Pressable
                key={`${group.cycleNumber}-${index}`}
                style={styles.tile}
                onPress={() => openViewer(group.cycleNumber, index)}
                disabled={!slot.url}
              >
                {slot.url ? (
                  <Image
                    source={{ uri: buildPhotoUrl(slot.url) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.empty, colors.backgroundSurface]}>
                    <Icon name="camera" width={22} height={22} />
                  </View>
                )}
                <Text fontSize={11} style={styles.tileLabel}>
                  {slot.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ))}

      {openedGroup && activeGroup && (
        <PhotoCycleModal
          visible
          photos={openedGroup.photos}
          initialIndex={activeGroup.initialIndex}
          cycleNumber={openedGroup.cycleNumber}
          uploadDate={openedGroup.uploadDate}
          onClose={closeViewer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 8,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  image: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
  },
  empty: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(7, 39, 35, 0.08)",
    opacity: 0.6,
  },
  tileLabel: {
    textAlign: "center",
  },
});

export default ProgressPhotosGallery;
