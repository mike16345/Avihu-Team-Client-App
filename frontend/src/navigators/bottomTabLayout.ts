export const FLOATING_TAB_BAR_HEIGHT = 70;
export const MINIMUM_TAB_BAR_BOTTOM_OFFSET = 20;
export const ACTIVE_INDICATOR_BOTTOM_OFFSET = 15;
export const FLOATING_TAB_BAR_SCENE_GAP = 10;

interface BottomTabLayoutInput {
  bottomInset: number;
  keyboardVisible: boolean;
}

export const getBottomTabLayout = ({ bottomInset, keyboardVisible }: BottomTabLayoutInput) => {
  const bottomOffset = Math.max(bottomInset, MINIMUM_TAB_BAR_BOTTOM_OFFSET);

  return {
    tabBarBottom: bottomOffset,
    activeIndicatorBottom: bottomOffset + ACTIVE_INDICATOR_BOTTOM_OFFSET,
    shadowBottom: bottomOffset,
    scenePaddingBottom: keyboardVisible
      ? bottomOffset
      : bottomOffset + FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_SCENE_GAP,
    tabBarVisible: !keyboardVisible,
  };
};
