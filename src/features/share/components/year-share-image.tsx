import { type ComponentRef, type Ref } from "react";

import { Text, View } from "react-native";

import { ShareImageFrame } from "@/shared/components/share-image-frame";
import { type Rally } from "@/shared/schemas/rallies";
import { formatRallyCount } from "@/shared/utils/format-rally-count";
import { formatStampCount } from "@/shared/utils/format-stamp-count";
import { formatStampDate } from "@/shared/utils/format-stamp-date-time";

import { type YearShare } from "../utils/year-share";

import { RestLine, YearStampGrid } from "./year-stamp-grid";

// The year review's pages, in order (docs/screens/year-review.md).
export const yearPages = ["Your year", "Rallies", "Months", "First & last"];

type YearShareImageProps = {
  ref?: Ref<ComponentRef<typeof View>>;
  year: number;
  // 1 to 4.
  page: number;
  share: YearShare;
};

// One page of the year review, drawn in the share image's frame: the screen
// shows it as it will be sent.
export function YearShareImage({
  ref,
  year,
  page,
  share,
}: YearShareImageProps) {
  const name = yearPages[page - 1];

  return (
    <ShareImageFrame
      ref={ref}
      label={String(year)}
      detail={name}
      aria-label={`${year}, ${name}, ${formatStampCount(share.stampCount)}, ${formatRallyCount(share.rallyCount)}`}
    >
      {page === 1 ? <CountPage share={share} /> : null}
      {page === 2 ? <RalliesPage share={share} /> : null}
      {page === 3 ? <YearStampGrid share={share} /> : null}
      {page === 4 ? <FirstAndLastPage share={share} /> : null}
    </ShareImageFrame>
  );
}

function CountPage({ share }: { share: YearShare }) {
  return (
    <View className="gap-1">
      <View className="flex-row items-baseline gap-2">
        <Text className="text-foreground text-large-title font-bold">
          {share.stampCount}
        </Text>
        <Text className="text-foreground-secondary text-subhead font-semibold">
          {share.stampCount === 1 ? "stamp" : "stamps"}
        </Text>
      </View>
      <Text className="text-foreground-muted text-subhead">
        {formatRallyCount(share.rallyCount)}
      </Text>
    </View>
  );
}

function RalliesPage({ share }: { share: YearShare }) {
  return (
    <View className="gap-2">
      {share.rows.map(({ rally, count }) => (
        <View
          key={rally.id}
          testID="year-rally-row"
          className="flex-row items-center gap-3"
        >
          <Text className="text-title2">{rally.emoji}</Text>
          <Text
            numberOfLines={1}
            className="text-foreground text-body flex-1 font-semibold"
          >
            {rally.name}
          </Text>
          <Text className="text-foreground text-title2 font-bold">{count}</Text>
        </View>
      ))}
      {share.rest ? <RestLine rest={share.rest} /> : null}
    </View>
  );
}

function FirstAndLastPage({ share }: { share: YearShare }) {
  return (
    <View className="gap-6">
      {share.first ? <Moment title="First" {...share.first} /> : null}
      {share.last ? <Moment title="Last" {...share.last} /> : null}
    </View>
  );
}

function Moment({
  title,
  rally,
  stampedAt,
}: {
  title: string;
  rally: Rally;
  stampedAt: string;
}) {
  const date = new Date(stampedAt);
  return (
    <View className="gap-1">
      <Text className="text-foreground-muted text-footnote font-semibold">
        {title}
      </Text>
      {/* The year is in the head, so the date leaves it out. */}
      <Text className="text-foreground text-title1 font-bold">
        {formatStampDate(date, date)}
      </Text>
      <Text numberOfLines={1} className="text-foreground text-body">
        {`${rally.emoji} ${rally.name}`}
      </Text>
    </View>
  );
}
