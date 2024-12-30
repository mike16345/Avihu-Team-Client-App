import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Updates from "expo-updates";

const Update = () => {
  const [updateMessageVisible, setUpdateMessageVisible] = useState(false);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setUpdateMessageVisible(true);
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    checkForUpdates();
  }, []);

  const installUpdate = async () => {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error("Error installing the update:", error);
    }
  };

  const closeModal = () => {
    setUpdateMessageVisible(false);
  };

  return (
    <>
      {updateMessageVisible && (
        <Modal
          transparent
          animationType="slide"
          visible={updateMessageVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Update Available</Text>
              <Text style={styles.modalText}>
                A new version of the app is available. Would you like to install the update now?
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={closeModal}>
                  <Text style={styles.buttonText}>Later</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.updateButton]}
                  onPress={installUpdate}
                >
                  <Text style={styles.buttonText}>Update</Text>
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
