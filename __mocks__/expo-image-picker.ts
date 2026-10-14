// Jest replaces `expo-image-picker` (native system picker). Tests decide what
// the user picks with `jest.mocked(launchImageLibraryAsync).mockResolvedValueOnce`.
export const launchImageLibraryAsync = jest.fn(async () => ({
  canceled: true,
  assets: null,
}));
