// Jest replaces `expo-sharing` (native share sheet). Tests read what was
// shared from `jest.mocked(shareAsync).mock.calls`.
export const shareAsync = jest.fn(
  async (_url: string, _options?: object) => {},
);
