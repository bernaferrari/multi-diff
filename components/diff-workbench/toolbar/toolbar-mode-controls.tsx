import { Columns3, Rows3 } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { Button } from "@/components/ui/button";

import { SegmentedControl, SegmentedControlItem, ToolbarTooltip } from "./toolbar-controls";
import type { DiffStyle, Layout } from "../shared/types";

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

const diffGlyphVariables = {
  "--diffs-addition-base": "light-dark(#18a46c, #07c480)",
  "--diffs-deletion-base": "light-dark(#d52c36, #ff2e3f)",
} as CSSProperties;

const DIFF_GLYPH_DELETION_FILL =
  "var(--diffs-fg-number-deletion-override,var(--diffs-deletion-base))";
const DIFF_GLYPH_ADDITION_FILL =
  "var(--diffs-fg-number-addition-override,var(--diffs-addition-base))";

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
  const label = diffStyle === "unified" ? "Switch to split" : "Switch to unified";

  return (
    <ToolbarTooltip label={label}>
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        aria-label={label}
        aria-pressed={diffStyle === "split"}
        onClick={() => onDiffStyle(nextStyle)}
        className="bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <DiffStyleIcon diffStyle={diffStyle} />
      </Button>
    </ToolbarTooltip>
  );
}

function DiffStyleIcon({ diffStyle }: { diffStyle: DiffStyle }) {
  if (diffStyle === "unified") return <UnifiedDiffGlyph />;

  return <SplitDiffGlyph />;
}

function UnifiedDiffGlyph() {
  return (
    <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24" style={diffGlyphVariables}>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4"
        className="fill-card stroke-muted-foreground/55 dark:fill-background dark:stroke-muted-foreground/70"
        strokeWidth="2.5"
      />
      <rect
        x="5.75"
        y="5.75"
        width="12.5"
        height="5.75"
        rx="1.75"
        style={{ fill: DIFF_GLYPH_DELETION_FILL }}
      />
      <rect
        x="5.75"
        y="12.5"
        width="12.5"
        height="5.75"
        rx="1.75"
        style={{ fill: DIFF_GLYPH_ADDITION_FILL }}
      />
    </svg>
  );
}

function SplitDiffGlyph() {
  return (
    <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 24 24" style={diffGlyphVariables}>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4"
        className="fill-card stroke-muted-foreground/55 dark:fill-background dark:stroke-muted-foreground/70"
        strokeWidth="2.5"
      />
      <rect
        x="5.75"
        y="5.75"
        width="5.75"
        height="12.5"
        rx="1.75"
        style={{ fill: DIFF_GLYPH_DELETION_FILL }}
      />
      <rect
        x="12.5"
        y="5.75"
        width="5.75"
        height="12.5"
        rx="1.75"
        style={{ fill: DIFF_GLYPH_ADDITION_FILL }}
      />
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
