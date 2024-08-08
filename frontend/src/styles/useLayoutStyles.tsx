import { StyleSheet } from "react-native";

export const useLayoutStyles = () => {
  const layoutStyles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
    },
    column: {
      flexDirection: "column",
    },
    spaceAround: {
      justifyContent: "space-around",
    },
    spaceEvenly: {
      justifyContent: "space-evenly",
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
    flexRow: {
      flexDirection: "row",
    },
    flexRowReverse: {
      flexDirection: "row-reverse",
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
  });

  return layoutStyles;
};
