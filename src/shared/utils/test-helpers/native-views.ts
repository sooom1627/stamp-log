import { screen } from "@testing-library/react-native";
import type * as PagerViewNativeComponent from "react-native-pager-view/lib/typescript/PagerViewNativeComponent";

// The large titles of the open stacks. The large title is a native header
// prop, not text in the tree.
export function largeTitles() {
  return screen.container
    .queryAll((instance) => instance.type === "RNSScreenStackHeaderConfig")
    .map((instance) => instance.props.title)
    .filter((title) => title !== "(tabs)");
}

// The native commands the pager sends to turn its page. Jest loads the
// package's CommonJS build, so spy on that copy.
export const { Commands: PagerViewCommands } = jest.requireActual<
  typeof PagerViewNativeComponent
>("react-native-pager-view/lib/commonjs/PagerViewNativeComponent");
