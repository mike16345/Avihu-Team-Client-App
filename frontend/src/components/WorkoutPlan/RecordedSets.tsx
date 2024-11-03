import { Text, View, FlatList } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import RecordedSetInfo from "./RecordedSetInfo";

interface RecordedSetsProps {
  route: any;
}

const RecordedSets: React.FC<RecordedSetsProps> = ({ route }) => {
  const { spacing, text } = useStyles();
  const { recordedSets } = route.params;

  return (
    <View style={[spacing.pdDefault]}>
      {recordedSets?.length ? (
        <FlatList
          data={recordedSets}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          keyExtractor={(item) => `${item.date}-${item.setNumber}`}
          renderItem={({ item }) => <RecordedSetInfo recordedSet={item} />}
        />
      ) : (
        <Text style={text.textCenter}>No recorded sets available.</Text>
      )}
    </View>
  );
};

export default RecordedSets;
