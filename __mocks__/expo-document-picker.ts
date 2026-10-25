// Jest replaces `expo-document-picker` (native system picker). Tests decide
// which file the user picks with
// `jest.mocked(getDocumentAsync).mockResolvedValueOnce`.
export const getDocumentAsync = jest.fn(
  async (
    _options?: object,
  ): Promise<
    | { canceled: true; assets: null }
    | { canceled: false; assets: { name: string; uri: string }[] }
  > => ({ canceled: true, assets: null }),
);
