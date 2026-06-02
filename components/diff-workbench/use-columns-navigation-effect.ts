import { useEffect, useRef } from "react";

import type { FileNavigationTarget, Layout } from "./types";

type NavigationTarget = FileNavigationTarget | null;

function shouldApplyColumnsNavigationTarget({
  appliedToken,
  layout,
  navigationTarget,
}: {
  appliedToken: number | null;
  layout: Layout;
  navigationTarget: NavigationTarget;
}) {
  return (
    layout === "columns" && navigationTarget != null && appliedToken !== navigationTarget.token
  );
}

export function useColumnsNavigationEffect({
  layout,
  navigationTarget,
  scrollToFile,
}: {
  layout: Layout;
  navigationTarget: NavigationTarget;
  scrollToFile: (name: string, behavior?: FileNavigationTarget["behavior"]) => void;
}) {
  const appliedToken = useRef<number | null>(null);

  useEffect(() => {
    const target = navigationTarget;

    if (
      !target ||
      !shouldApplyColumnsNavigationTarget({
        appliedToken: appliedToken.current,
        layout,
        navigationTarget: target,
      })
    ) {
      return;
    }

    scrollToFile(target.name, target.behavior);
    appliedToken.current = target.token;
  }, [layout, navigationTarget, scrollToFile]);
}
