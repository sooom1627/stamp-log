import { router } from "expo-router";

import { toast } from "sonner-native";

import { i18n } from "@/shared/i18n";

// S-002 / S-035 memo and photos prompt shown after a stamp is saved (home and past stamp).
// Not a component, so it uses the imperative `router` instead of useRouter().
export function showAddMemoToast(stampId: number) {
  const toastId = toast(i18n.t("stampForm.addMemoToast"), {
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
      label: i18n.t("stampForm.add"),
      onClick: () => {
        toast.dismiss(toastId);
        router.push({ pathname: "/add-stamp-memo", params: { stampId } });
      },
    },
  });
}
