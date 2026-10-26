import Storage from "expo-sqlite/kv-store";

// A device setting, not app data: kept out of the app database, so export and
// import never carry it. Read synchronously so the first screen never flickers.
const onboardedKey = "onboarding.done";

export function hasOnboarded(): boolean {
  return Storage.getItemSync(onboardedKey) === "true";
}

export function markOnboarded(): void {
  Storage.setItemSync(onboardedKey, "true");
}
