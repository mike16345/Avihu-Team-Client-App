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
    spaceBetween: {
      justifyContent: "space-between",
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
    fullWidth: {
      width: "100%",
    },
    fullHeight: {
      height: "100%",
    },
    fullSize: {
      width: "100%",
      height: "100%",
    },
    flex1: {
      flex: 1,
    },
    flexRow: {
      flexDirection: "row",
    },
    flexColumn: {
      flexDirection: "column",
    },
    justifyContentCenter: {
      justifyContent: "center",
    },
    justifyContentBetween: {
      justifyContent: "space-between",
    },
    alignItemsCenter: {
      alignItems: "center",
    },
    alignItemsStart: {
      alignItems: "flex-start",
    },
    alignItemsEnd: {
      alignItems: "flex-end",
    },
  });

  return layoutStyles;
};
