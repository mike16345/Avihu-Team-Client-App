export const getIconName = (isTrue: boolean) => {
  return isTrue ? "arrowRoundLeftSoftSmall" : "arrowRoundRightSmall";
};

export const getIconRotation = (isTrue: boolean, edge: "start" | "end") => {
  if (edge == "start") {
    return isTrue ? 0 : 180;
  } else {
    return isTrue ? 180 : 0;
  }
};
