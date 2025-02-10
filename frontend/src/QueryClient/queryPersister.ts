import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

export default persister;
