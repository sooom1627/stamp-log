// Jest replaces `expo-web-browser` (the in-app Safari sheet). Tests read the
// opened URL from `jest.mocked(openBrowserAsync).mock.calls`.
export const openBrowserAsync = jest.fn(
  async (_url: string, _options?: object) => ({ type: "cancel" }),
);
