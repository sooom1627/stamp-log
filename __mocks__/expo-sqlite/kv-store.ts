// Jest replaces `expo-sqlite/kv-store` (native) with an in-memory map.
// Only the API surface used by the app is implemented.
const items = new Map<string, string>();

export const Storage = {
  getItemSync: (key: string) => items.get(key) ?? null,
  setItemSync: (key: string, value: string) => {
    items.set(key, value);
  },
  clearSync: () => {
    items.clear();
    return true;
  },
};

export default Storage;
