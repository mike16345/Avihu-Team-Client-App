import { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { Text } from "@/components/ui/Text";

const UPDATE_FLAG_KEY = "pending_update";
const UPDATE_SKIP_COUNT_KEY = "pending_update_skips";
const MAX_SKIPS = 3; // Allow 3 times before forcing update

const Update = () => {
  const [updateMessageVisible, setUpdateMessageVisible] = useState(false);
  const queryClient = useQueryClient();

  const installUpdate = async () => {
    try {
      await Updates.fetchUpdateAsync();
      await AsyncStorage.multiRemove([UPDATE_FLAG_KEY, UPDATE_SKIP_COUNT_KEY]);
      queryClient.clear();
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Error installing the update:", error);
    }
  };

  const closeModal = async () => {
    setUpdateMessageVisible(false);
    const count = parseInt((await AsyncStorage.getItem(UPDATE_SKIP_COUNT_KEY)) || "0", 10);
    await AsyncStorage.setItem(UPDATE_SKIP_COUNT_KEY, String(count + 1));
  };

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        if (!Updates.isEmbeddedLaunch) {
          console.log("Running in Expo Go, skipping update check.");
          return;
        }

        const pending = await AsyncStorage.getItem(UPDATE_FLAG_KEY);
        const skips = parseInt((await AsyncStorage.getItem(UPDATE_SKIP_COUNT_KEY)) || "0", 10);

        if (pending) {
          if (skips >= MAX_SKIPS) {
            // Force update after too many skips
            await installUpdate();
          } else {
            setUpdateMessageVisible(true);
          }
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await AsyncStorage.setItem(UPDATE_FLAG_KEY, "true");
          await AsyncStorage.setItem(UPDATE_SKIP_COUNT_KEY, "0");
          setUpdateMessageVisible(true);
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    checkForUpdates();
  }, []);

  return (
    <>
      {updateMessageVisible && (
        <Modal transparent animationType="slide" visible onRequestClose={closeModal}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>עדכון זמין</Text>
              <Text style={styles.modalText}>
                גרסה חדשה של האפליקציה זמינה. מומלץ לעדכן כדי לקבל את כל השיפורים והתיקונים
                האחרונים.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.updateButton]}
                  onPress={installUpdate}
                >
                  <Text style={styles.buttonText}>עדכן עכשיו</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={closeModal}>
                  <Text style={styles.buttonText}>אחר כך</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default Update;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  updateButton: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
