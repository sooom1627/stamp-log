import { fireEvent, screen } from "@testing-library/react-native";
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

// A Stack.Toolbar button or menu item as react-native-screens hands it to the
// native header (headerLeftBarButtonItems / headerRightBarButtonItems).
type HeaderItem = {
  type: string;
  accessibilityLabel?: string;
  title?: string;
  sfSymbolName?: string;
  destructive?: boolean;
  tintColor?: unknown;
  buttonId?: string;
  menuId?: string;
  menu?: { items: HeaderItem[] };
};

function headerItemsOf(props: {
  headerLeftBarButtonItems?: HeaderItem[];
  headerRightBarButtonItems?: HeaderItem[];
}) {
  return [
    ...(props.headerLeftBarButtonItems ?? []),
    ...(props.headerRightBarButtonItems ?? []),
  ];
}

// The header that has a toolbar item with this accessibility label, and the
// item. Throws unless exactly one open header has it.
function findHeaderItem(label: string) {
  const found = screen.container
    .queryAll((instance) => instance.type === "RNSScreenStackHeaderConfig")
    .flatMap((config) =>
      headerItemsOf(config.props)
        .filter((item) => item.accessibilityLabel === label)
        .map((item) => ({ config, item })),
    );
  if (found.length !== 1) {
    throw new Error(
      `Expected one header item labelled "${label}", found ${found.length}`,
    );
  }
  return found[0];
}

// A Stack.Toolbar.Button or Stack.Toolbar.Menu by its accessibility label.
export function headerItem(label: string) {
  return findHeaderItem(label).item;
}

// The actions of a Stack.Toolbar.Menu, in order.
export function headerMenuItems(menuLabel: string) {
  return findHeaderItem(menuLabel).item.menu?.items ?? [];
}

// Presses a Stack.Toolbar.Button the way the native header reports it.
export async function pressHeaderButton(label: string) {
  const { config, item } = findHeaderItem(label);
  await fireEvent(config, "pressHeaderBarButtonItem", {
    nativeEvent: { buttonId: item.buttonId },
  });
}

// Chooses a Stack.Toolbar.MenuAction by its title the way the native header
// reports it.
export async function pressHeaderMenuItem(menuLabel: string, title: string) {
  const { config, item } = findHeaderItem(menuLabel);
  const action = item.menu?.items.find((menuItem) => menuItem.title === title);
  if (!action) {
    throw new Error(`No "${title}" in the "${menuLabel}" header menu`);
  }
  await fireEvent(config, "pressHeaderBarButtonMenuItem", {
    nativeEvent: { menuId: action.menuId },
  });
}
