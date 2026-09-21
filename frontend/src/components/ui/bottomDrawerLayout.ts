const BOTTOM_DRAWER_BOTTOM_OFFSET = 30;

interface BottomDrawerLayoutInput {
  screenHeight: number;
  bottomBarHeight: number;
  topOffset: number;
  minHeight: number;
}

export const getBottomDrawerMaxHeight = ({
  screenHeight,
  bottomBarHeight,
  topOffset,
  minHeight,
}: BottomDrawerLayoutInput) =>
  Math.max(screenHeight - bottomBarHeight - BOTTOM_DRAWER_BOTTOM_OFFSET - topOffset, minHeight);
