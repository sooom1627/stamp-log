// Jest replaces `react-native-view-shot` (native view capture). Tests read the
// view and options from `jest.mocked(captureRef).mock.calls`; the file it
// "writes" is a fixed temporary png.
export const captureRef = jest.fn(
  async (_view: unknown, _options?: object) => "file:///tmp/share-image.png",
);
