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

const SVG_TO_ICON_SCALE = 18 / 24;
const DIFF_GLYPH_BLOCKS = {
  unifiedDeletion: scaleSvgRect({ height: 5.75, left: 5.75, top: 5.75, width: 12.5 }),
  unifiedAddition: scaleSvgRect({ height: 5.75, left: 5.75, top: 12.5, width: 12.5 }),
  splitDeletion: scaleSvgRect({ height: 12.5, left: 5.75, top: 5.75, width: 5.75 }),
  splitAddition: scaleSvgRect({ height: 12.5, left: 12.5, top: 5.75, width: 5.75 }),
} satisfies Record<string, DiffGlyphBlockStyle>;

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
  const split = diffStyle === "split";
  const deletionBlock = split ? DIFF_GLYPH_BLOCKS.splitDeletion : DIFF_GLYPH_BLOCKS.unifiedDeletion;
  const additionBlock = split ? DIFF_GLYPH_BLOCKS.splitAddition : DIFF_GLYPH_BLOCKS.unifiedAddition;

  return (
    <span className="relative block size-[18px]" aria-hidden="true" style={diffGlyphVariables}>
      <svg className="absolute inset-0 size-[18px]" viewBox="0 0 24 24">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="4"
          className="fill-card stroke-muted-foreground/55 dark:fill-background dark:stroke-muted-foreground/70"
          strokeWidth="2.5"
        />
      </svg>
      <DiffGlyphBlock kind="deletion" style={deletionBlock} />
      <DiffGlyphBlock kind="addition" style={additionBlock} />
    </span>
  );
}

type DiffGlyphBlockStyle = Pick<CSSProperties, "height" | "left" | "top" | "width">;

function scaleSvgRect(rect: Record<keyof DiffGlyphBlockStyle, number>): DiffGlyphBlockStyle {
  return {
    height: rect.height * SVG_TO_ICON_SCALE,
    left: rect.left * SVG_TO_ICON_SCALE,
    top: rect.top * SVG_TO_ICON_SCALE,
    width: rect.width * SVG_TO_ICON_SCALE,
  };
}

function DiffGlyphBlock({
  kind,
  style,
}: {
  kind: "addition" | "deletion";
  style: DiffGlyphBlockStyle;
}) {
  return (
    <span
      className="absolute rounded-[1.3px] transition-[left,top,width,height] duration-300 ease-[cubic-bezier(0.165,0.85,0.45,1)] motion-reduce:transition-none"
      style={{
        ...style,
        background: kind === "addition" ? DIFF_GLYPH_ADDITION_FILL : DIFF_GLYPH_DELETION_FILL,
      }}
    />
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
