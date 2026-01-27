import { Platform, StyleSheet } from "react-native";

export const useLayoutStyles = () => {
  const layoutStyles = StyleSheet.create({
    absolute: {
      position: "absolute",
    },
    container: {
      flex: 1,
      padding: 16,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    direction: {
      direction: "inherit",
    },
    rtl: {
      direction: "rtl",
    },
    ltr: {
      direction: "ltr",
    },
    wrap: {
      flexWrap: "wrap",
    },
    noWrap: {
      flexWrap: "nowrap",
    },
    widthFull: {
      width: "100%",
    },
    heightFull: {
      height: "100%",
    },
    sizeFull: {
      width: "100%",
      height: "100%",
    },
    flex1: {
      flex: 1,
    },
    flexGrow: {
      flexGrow: 1,
    },
    flexRow: {
      flexDirection: "row",
    },
    flexRowReverse: {
      flexDirection: "row-reverse",
    },
    flexDirectionByPlatform: {
      flexDirection: Platform.OS == `android` ? "row-reverse" : "row",
    },
    flexColumnReverse: {
      flexDirection: "column-reverse",
    },
    flexColumn: {
      flexDirection: "column",
    },
    justifyStart: {
      justifyContent: "flex-start",
    },
    justifyEnd: {
      justifyContent: "flex-end",
    },
    justifyAround: {
      justifyContent: "space-around",
    },
    justifyEvenly: {
      justifyContent: "space-evenly",
    },
    justifyCenter: {
      justifyContent: "center",
    },
    justifyBetween: {
      justifyContent: "space-between",
    },
    itemsCenter: {
      alignItems: "center",
    },
    itemsStart: {
      alignItems: "flex-start",
    },
    itemsEnd: {
      alignItems: "flex-end",
    },
    alignSelfStart: {
      alignSelf: "flex-start",
    },
    alignSelfCenter: {
      alignSelf: "center",
    },
    alignSelfEnd: {
      alignSelf: "flex-end",
    },
  });

  return layoutStyles;
};
