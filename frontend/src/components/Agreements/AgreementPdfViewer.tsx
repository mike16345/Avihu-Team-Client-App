import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Pdf from "react-native-pdf";
import { IAgreement } from "@/mock/agreement";
import { Text } from "@/components/ui/Text";

interface AgreementPdfViewerProps {
  agreement: IAgreement;
}

const AgreementPdfViewer = ({ agreement }: AgreementPdfViewerProps) => {
  if (!agreement.pdfUrl) {
    return <Text>No PDF URL provided</Text>;
  }

  const source = { uri: agreement.pdfUrl, cache: true };

  return (
    <View style={styles.container}>
      <Pdf
        source={source}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}`);
        }}
        onError={(error) => {
          console.log(error);
        }}
        onPressLink={(uri) => {
          console.log(`Link pressed: ${uri}`);
        }}
        style={styles.pdf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default AgreementPdfViewer;
