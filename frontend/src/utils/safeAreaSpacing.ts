interface SafeAreaInsets {
  top: number;
  bottom: number;
}

export const getSafeAreaPadding = (
  insets: SafeAreaInsets,
  minimumBottom: number
): { paddingTop: number; paddingBottom: number } => ({
  paddingTop: insets.top,
  paddingBottom: Math.max(insets.bottom, minimumBottom),
});
