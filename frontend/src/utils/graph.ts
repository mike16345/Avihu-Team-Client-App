export const returnIconName = (isTrue: boolean) => {
  return isTrue ? "arrowRoundLeftSoftSmall" : "arrowRoundRightSmall";
};

export const returnIconRotation = (isTrue: boolean, edge: "start" | "end") => {
  if (edge == "start") {
    return isTrue ? 0 : 180;
  } else {
    isTrue ? 180 : 0;
  }
};
