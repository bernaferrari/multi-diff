import { cn } from "@/lib/utils";

import { laneLabel, laneStyle } from "./lanes";
import type { LaneId } from "../shared/types";

type LaneBadgeSize = "sm" | "md";
type LaneBadgeTone = "solid" | "soft";

const sizeClass: Record<LaneBadgeSize, string> = {
  sm: "size-3 rounded-[3px] text-[8px]",
  md: "size-5 rounded-md text-[11px]",
};

export function LaneBadge({
  id,
  present = true,
  size = "md",
  tone = "solid",
}: {
  id: LaneId;
  present?: boolean;
  size?: LaneBadgeSize;
  tone?: LaneBadgeTone;
}) {
  const style = laneStyle(id);

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center leading-none font-bold",
        sizeClass[size],
        present
          ? tone === "solid"
            ? cn(
                "text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28),inset_0_-1px_0_rgb(0_0_0/0.16)]",
                style.dot,
              )
            : cn(style.soft, style.text)
          : "bg-muted text-muted-foreground/35",
      )}
    >
      {laneLabel(id)}
    </span>
  );
}
