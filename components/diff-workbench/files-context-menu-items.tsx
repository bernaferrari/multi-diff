import { Eye, EyeOff, RotateCcw } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { ContextMenuItem } from "@/components/ui/context-menu";

type MenuIcon = ComponentType<{ className?: string }>;

export function VisibilityMenuItem({
  hidden,
  hideLabel,
  showLabel,
  onHide,
  onShow,
}: {
  hidden: boolean;
  hideLabel: string;
  showLabel: string;
  onHide: () => void;
  onShow: () => void;
}) {
  return hidden ? (
    <ShowMenuItem onClick={onShow}>{showLabel}</ShowMenuItem>
  ) : (
    <ContextMenuItem onClick={onHide}>
      <EyeOff className="size-4" />
      {hideLabel}
    </ContextMenuItem>
  );
}

function FileActionMenuItem({
  children,
  className,
  icon: Icon,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  icon: MenuIcon;
  onClick: () => void;
}) {
  return (
    <ContextMenuItem onClick={onClick} className={className}>
      <Icon className="size-4" />
      {children}
    </ContextMenuItem>
  );
}

export function ShowMenuItem({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <FileActionMenuItem icon={Eye} onClick={onClick} className={className}>
      {children}
    </FileActionMenuItem>
  );
}

export function RestoreMenuItem({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
}) {
  return (
    <FileActionMenuItem icon={RotateCcw} onClick={onClick} className={className}>
      {children}
    </FileActionMenuItem>
  );
}
