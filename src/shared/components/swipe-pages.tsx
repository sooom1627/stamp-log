import { useEffect, useRef, type ReactNode } from "react";

import { View } from "react-native";

import PagerView from "react-native-pager-view";

type SwipePagesProps<T extends string> = {
  // Names the pager; each page is `${testID}-${value}`.
  testID: string;
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
  renderPage: (value: T) => ReactNode;
};

// One page per value of a segmented switch (S-043): the page follows the
// finger and snaps, and the switch and the page always show the same value.
export function SwipePages<T extends string>({
  testID,
  values,
  value,
  onChange,
  renderPage,
}: SwipePagesProps<T>) {
  const pagerRef = useRef<PagerView>(null);
  const index = values.indexOf(value);

  // The switch changed the value: turn to its page. After a swipe the pager
  // already shows it, so this asks for the page it is on.
  useEffect(() => {
    pagerRef.current?.setPage(index);
  }, [index]);

  return (
    <PagerView
      ref={pagerRef}
      testID={testID}
      style={{ flex: 1 }}
      initialPage={index}
      onPageSelected={({ nativeEvent: { position } }) =>
        onChange(values[position])
      }
    >
      {values.map((page) => (
        <View key={page} testID={`${testID}-${page}`}>
          {renderPage(page)}
        </View>
      ))}
    </PagerView>
  );
}
