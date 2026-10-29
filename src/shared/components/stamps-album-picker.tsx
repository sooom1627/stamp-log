import { Host, Picker, Text } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

export type StampsView = "stamps" | "album";

// In the order of the segments, for switching by a sideways swipe.
export const stampsViews: readonly StampsView[] = ["stamps", "album"];

type StampsAlbumPickerProps = {
  testID: string;
  view: StampsView;
  stampCount: number;
  photoCount: number;
  onChangeView: (view: StampsView) => void;
};

// The system segmented control (S-037): Logs and rally detail switch between
// the timeline and the Album with it. Drawn by iOS, not by the app.
export function StampsAlbumPicker({
  testID,
  view,
  stampCount,
  photoCount,
  onChangeView,
}: StampsAlbumPickerProps) {
  return (
    <Host matchContents={{ vertical: true }}>
      <Picker
        testID={testID}
        label="View"
        selection={view}
        onSelectionChange={onChangeView}
        modifiers={[pickerStyle("segmented")]}
      >
        <Text modifiers={[tag("stamps")]}>{`Stamps · ${stampCount}`}</Text>
        <Text modifiers={[tag("album")]}>{`Album · ${photoCount}`}</Text>
      </Picker>
    </Host>
  );
}
