import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Pdf from "react-native-pdf";
import SpinningIcon from "./loaders/SpinningIcon";

interface Props {
  uri: string;
  onScrollToEnd: () => void;
}

const PDFViewer: React.FC<Props> = ({ uri, onScrollToEnd }) => {
  const source = useMemo(
    () => ({
      uri,
      cache: true,
    }),
    [uri]
  );

  return (
    <View style={styles.container}>
      <Pdf
        source={source}
        trustAllCerts={false}
        style={styles.pdf}
        onLoadComplete={(pages) => {
          console.log(`Loaded PDF with ${pages} pages`);
        }}
        onPageChanged={(page, numberOfPages) => {
          if (page !== numberOfPages) return;
          onScrollToEnd();
        }}
        onError={(error) => {
          console.error("PDF load error", error);
        }}
        renderActivityIndicator={() => <SpinningIcon mode="light" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
  },
});

export default PDFViewer;
