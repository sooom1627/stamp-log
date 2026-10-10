import { Alert } from "react-native";

// Rally detail, the rally day sheet and Logs ask the same question before a
// stamp is deleted.
export function confirmDeleteStamp(onDelete: () => void) {
  Alert.alert("Delete stamp?", "This action cannot be undone.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onDelete },
  ]);
}
