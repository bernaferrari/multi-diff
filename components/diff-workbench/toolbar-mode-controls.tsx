import { AlignLeft, Columns3, Rows3, SplitSquareHorizontal } from "lucide-react";
import type { ReactNode } from "react";

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

const DIFF_STYLE_OPTIONS = [
  {
    icon: <AlignLeft className="size-3.5" />,
    label: "Unified",
    value: "unified",
  },
  {
    icon: <SplitSquareHorizontal className="size-3.5" />,
    label: "Split",
    value: "split",
  },
] satisfies Array<ModeOption<DiffStyle>>;

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
  return (
    <ModeSegmentedControl options={DIFF_STYLE_OPTIONS} value={diffStyle} onValue={onDiffStyle} />
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
