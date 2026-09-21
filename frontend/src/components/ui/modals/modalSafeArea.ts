export const MODAL_MINIMUM_TOP_PADDING = 48;
export const MODAL_MINIMUM_BOTTOM_PADDING = 60;
export const MODAL_HORIZONTAL_PADDING = 24;

interface ModalSafeAreaInsets {
  top: number;
  bottom: number;
}

export const getModalSafeAreaPadding = (insets: ModalSafeAreaInsets) => ({
  paddingTop: Math.max(insets.top, MODAL_MINIMUM_TOP_PADDING),
  paddingBottom: Math.max(insets.bottom, MODAL_MINIMUM_BOTTOM_PADDING),
});
