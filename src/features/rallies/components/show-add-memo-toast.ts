import { router } from "expo-router";

import { toast } from "sonner-native";

// S-002 memo prompt shown after a stamp is saved (home and past stamp).
// Not a component, so it uses the imperative `router` instead of useRouter().
export function showAddMemoToast(stampId: number) {
  const toastId = toast("Add a memo?", {
    duration: 5000,
    styles: {
      textContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      },
      buttons: {
        marginTop: 0,
        marginLeft: "auto",
      },
    },
    action: {
      label: "Add memo",
      onClick: () => {
        toast.dismiss(toastId);
        router.push({ pathname: "/add-stamp-memo", params: { stampId } });
      },
    },
  });
}
