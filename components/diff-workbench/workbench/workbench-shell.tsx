"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function WorkbenchShell({
  onSidebarClose,
  sidebar,
  sidebarOpen,
  viewport,
}: {
  onSidebarClose: () => void;
  sidebar: ReactNode;
  sidebarOpen: boolean;
  viewport: ReactNode;
}) {
  const mobileDrawer = useMobileDrawer();

  return (
    <div className={workbenchGridClass(sidebarOpen)}>
      <Sheet open={sidebarOpen && mobileDrawer} onOpenChange={(open) => !open && onSidebarClose()}>
        <SheetContent
          side="left"
          showCloseButton={false}
          aria-label="Files drawer"
          overlayClassName="bg-background/65 backdrop-blur-[2px] md:hidden"
          className={mobileSheetContentClass()}
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-9 shrink-0 items-center justify-end border-b border-border/70 bg-background px-2">
              <SheetClose
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close files drawer"
                    className="text-muted-foreground hover:text-foreground"
                  />
                }
              >
                <XIcon className="size-4" />
              </SheetClose>
            </div>
            <div className="min-h-0 flex-1">{sidebar}</div>
          </div>
        </SheetContent>
      </Sheet>

      <div className={desktopSidebarSlotClass(sidebarOpen)}>
        <div className={sidebarPanelClass(sidebarOpen)}>{sidebar}</div>
      </div>
      <div className="flex min-h-0 min-w-0 overflow-hidden">{viewport}</div>
    </div>
  );
}

function useMobileDrawer() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile;
}

function workbenchGridClass(sidebarOpen: boolean) {
  return cn(
    "relative grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] overflow-hidden md:transition-[grid-template-columns] md:duration-[240ms] md:ease-in-out md:motion-reduce:transition-none",
    sidebarOpen ? "md:grid-cols-[16rem_minmax(0,1fr)]" : "md:grid-cols-[0rem_minmax(0,1fr)]",
  );
}

export function mobileSheetContentClass() {
  return cn(
    "!w-64 max-w-[calc(100vw-1rem)] gap-0 border-r border-border/70 bg-background p-0 data-[side=left]:!w-64 md:hidden",
  );
}

function desktopSidebarSlotClass(sidebarOpen: boolean) {
  return cn("hidden min-w-0 overflow-hidden md:block", !sidebarOpen && "pointer-events-none");
}

function sidebarPanelClass(sidebarOpen: boolean) {
  return cn(
    "h-full transition-[opacity,transform] duration-[240ms] ease-in-out motion-reduce:transition-none",
    sidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 md:-translate-x-3",
  );
}
