export const getTextStartAlignment = (
  isRTL: boolean,
  swapsLeftAndRightInRTL: boolean
): "left" | "right" => {
  if (!isRTL) return "left";
  return swapsLeftAndRightInRTL ? "left" : "right";
};
