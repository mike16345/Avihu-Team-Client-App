import { FlatList, Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import { buildPhotoUrl } from "@/utils/utils";
import { useWindowDimensions } from "react-native";

type PhotoSlot = { label: string; url?: string };

interface PhotoCycleModalProps {
  visible: boolean;
  photos: PhotoSlot[];
  initialIndex: number;
  cycleNumber: number;
  uploadDate?: string;
  onClose: () => void;
}

const PhotoCycleModal: React.FC<PhotoCycleModalProps> = ({
  visible,
  photos,
  initialIndex,
  cycleNumber,
  uploadDate,
  onClose,
}) => {
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<PhotoSlot>>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;
    setActiveIndex(initialIndex);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: initialIndex * width, animated: false });
    });
  }, [visible, initialIndex, width]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.header}>
          <View>
            <Text fontSize={16} fontVariant="bold" style={styles.headerText}>
              מחזור {cycleNumber}
            </Text>
            {uploadDate && (
              <Text fontSize={12} fontVariant="light" style={styles.headerText}>
                {uploadDate}
              </Text>
            )}
          </View>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Icon name="close" width={22} height={22} />
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          keyExtractor={(_, i) => `photo-${cycleNumber}-${i}`}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(idx);
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width, height: height * 0.65 }]}>
              {item.url ? (
                <View style={styles.imageFrame}>
                  <Image
                    source={{ uri: buildPhotoUrl(item.url) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="camera" width={36} height={36} />
                  <Text fontSize={13} style={styles.emptyText}>
                    התמונה עדיין לא הועלתה
                  </Text>
                </View>
              )}
            </View>
          )}
        />

        <View style={styles.footer}>
          <Text fontSize={14} fontVariant="bold" style={styles.footerLabel}>
            {photos[activeIndex]?.label}
          </Text>
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerText: {
    color: "#072723",
    textAlign: "right",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(7, 39, 35, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  imageFrame: {
    width: "92%",
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    alignItems: "center",
    gap: 10,
    opacity: 0.7,
  },
  emptyText: {
    color: "#072723",
  },
  footer: {
    paddingBottom: 40,
    alignItems: "center",
    gap: 12,
  },
  footerLabel: {
    color: "#072723",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(7, 39, 35, 0.25)",
  },
  dotActive: {
    backgroundColor: "#072723",
    width: 18,
  },
});

export default PhotoCycleModal;
