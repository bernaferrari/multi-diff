import { Columns3, Rows3 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import { SegmentedControl, SegmentedControlItem } from "./toolbar-controls";
import type { DiffStyle, Layout } from "./types";

type ModeOption<TValue extends string> = {
  icon: ReactNode;
  label: string;
  value: TValue;
};

const LAYOUT_OPTIONS = [
  {
    icon: <Columns3 className="size-3.5" />,
    label: "Columns",
    value: "columns",
  },
  {
    icon: <Rows3 className="size-3.5" />,
    label: "Rows",
    value: "rows",
  },
] satisfies Array<ModeOption<Layout>>;

export function LayoutModeControl({
  layout,
  onLayout,
}: {
  layout: Layout;
  onLayout: (layout: Layout) => void;
}) {
  return <ModeSegmentedControl options={LAYOUT_OPTIONS} value={layout} onValue={onLayout} />;
}

export function DiffStyleControl({
  diffStyle,
  onDiffStyle,
}: {
  diffStyle: DiffStyle;
  onDiffStyle: (diffStyle: DiffStyle) => void;
}) {
  const nextStyle = diffStyle === "unified" ? "split" : "unified";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-xs"
      aria-label={`Switch to ${nextStyle} diff view`}
      aria-pressed={diffStyle === "split"}
      onClick={() => onDiffStyle(nextStyle)}
      className="bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <DiffStyleIcon diffStyle={diffStyle} />
    </Button>
  );
}

function DiffStyleIcon({ diffStyle }: { diffStyle: DiffStyle }) {
  if (diffStyle === "unified") return <UnifiedDiffGlyph />;

  return <SplitDiffGlyph />;
}

function UnifiedDiffGlyph() {
  return (
    <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24">
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4"
        fill="var(--background)"
        stroke="color-mix(in oklch, var(--foreground) 42%, transparent)"
        strokeWidth="2.5"
      />
      <rect x="5.75" y="5.75" width="12.5" height="5.75" rx="1.75" fill="#991b1b" />
      <rect x="5.75" y="12.5" width="12.5" height="5.75" rx="1.75" fill="#15803d" />
    </svg>
  );
}

function SplitDiffGlyph() {
  return (
    <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24">
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4"
        fill="var(--background)"
        stroke="color-mix(in oklch, var(--foreground) 42%, transparent)"
        strokeWidth="2.5"
      />
      <rect x="5.75" y="5.75" width="5.75" height="12.5" rx="1.75" fill="#991b1b" />
      <rect x="12.5" y="5.75" width="5.75" height="12.5" rx="1.75" fill="#15803d" />
    </svg>
  );
}

function ModeSegmentedControl<TValue extends string>({
  options,
  value,
  onValue,
}: {
  options: Array<ModeOption<TValue>>;
  value: TValue;
  onValue: (value: TValue) => void;
}) {
  return (
    <SegmentedControl>
      {options.map((option) => (
        <SegmentedControlItem
          key={option.value}
          active={value === option.value}
          icon={option.icon}
          label={option.label}
          onClick={() => onValue(option.value)}
        />
      ))}
    </SegmentedControl>
  );
}
