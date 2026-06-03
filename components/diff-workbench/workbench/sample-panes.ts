import { LANE_ORDER } from "../lanes/lanes";
import { createPane, normalizePatchInput } from "../rendering/diff-data";
import type { Pane } from "../shared/types";

const samples = [
  `diff --git a/app/mission-control/page.tsx b/app/mission-control/page.tsx
index 2a8f410..8c0b9d2 100644
--- a/app/mission-control/page.tsx
+++ b/app/mission-control/page.tsx
@@ -1,16 +1,29 @@
 import { LaunchTimeline } from "@/components/launch-timeline"
 import { MissionMap } from "@/components/mission-map"
 import { StatusStrip } from "@/components/status-strip"
+import { WeatherBand } from "@/components/weather-band"
 
 export default function MissionControlPage() {
   return (
-    <main className="grid gap-4 p-6">
-      <StatusStrip />
-      <div className="grid grid-cols-[1fr_360px] gap-4">
+    <main className="grid min-h-screen gap-4 bg-slate-950 p-6 text-slate-50">
+      <StatusStrip tone="launch" />
+      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-4">
         <MissionMap />
-        <LaunchTimeline />
+        <aside className="grid gap-4">
+          <WeatherBand zone="cape-canaveral" />
+          <LaunchTimeline density="comfortable" />
+        </aside>
       </div>
     </main>
   )
 }
diff --git a/components/status-strip.tsx b/components/status-strip.tsx
index 6f43b0c..5a54a84 100644
--- a/components/status-strip.tsx
+++ b/components/status-strip.tsx
@@ -1,11 +1,19 @@
-export function StatusStrip() {
+type StatusStripProps = {
+  tone?: "normal" | "launch"
+}
+
+export function StatusStrip({ tone = "normal" }: StatusStripProps) {
   return (
-    <section className="flex items-center gap-3 rounded-lg border p-3">
-      <strong>Systems nominal</strong>
+    <section className="flex items-center gap-3 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3">
+      <strong>{tone === "launch" ? "Launch window open" : "Systems nominal"}</strong>
       <span>Fuel stable</span>
       <span>Telemetry online</span>
+      <span className="ml-auto rounded-full bg-emerald-300 px-2 py-0.5 text-xs text-emerald-950">
+        T-14m
+      </span>
     </section>
   )
 }
diff --git a/components/weather-band.tsx b/components/weather-band.tsx
new file mode 100644
index 0000000..78acd61
--- /dev/null
+++ b/components/weather-band.tsx
@@ -0,0 +1,15 @@
+type WeatherBandProps = {
+  zone: "cape-canaveral" | "vandenberg"
+}
+
+export function WeatherBand({ zone }: WeatherBandProps) {
+  return (
+    <section className="rounded-lg border border-sky-300/25 bg-sky-400/10 p-4">
+      <p className="text-xs uppercase tracking-wide text-sky-200">Weather</p>
+      <p className="mt-1 text-lg font-semibold">Crosswinds easing</p>
+      <p className="text-sm text-sky-100/75">
+        {zone === "cape-canaveral" ? "Range green in 11 minutes." : "Marine layer clearing."}
+      </p>
+    </section>
+  )
+}
`,
  `diff --git a/app/mission-control/page.tsx b/app/mission-control/page.tsx
index 2a8f410..19ed2d0 100644
--- a/app/mission-control/page.tsx
+++ b/app/mission-control/page.tsx
@@ -1,16 +1,28 @@
 import { LaunchTimeline } from "@/components/launch-timeline"
 import { MissionMap } from "@/components/mission-map"
 import { StatusStrip } from "@/components/status-strip"
+import { CrewComms } from "@/components/crew-comms"
 
 export default function MissionControlPage() {
   return (
-    <main className="grid gap-4 p-6">
-      <StatusStrip />
-      <div className="grid grid-cols-[1fr_360px] gap-4">
+    <main className="grid min-h-screen grid-rows-[auto_minmax(0,1fr)] gap-4 p-6">
+      <StatusStrip compact />
+      <div className="grid grid-cols-[320px_minmax(0,1fr)_360px] gap-4">
+        <CrewComms channel="dragon" />
         <MissionMap />
-        <LaunchTimeline />
+        <LaunchTimeline showAbortChecks />
       </div>
     </main>
   )
 }
diff --git a/components/crew-comms.tsx b/components/crew-comms.tsx
new file mode 100644
index 0000000..8dfcf10
--- /dev/null
+++ b/components/crew-comms.tsx
@@ -0,0 +1,24 @@
+type CrewCommsProps = {
+  channel: "dragon" | "orion"
+}
+
+const messages = [
+  "Suit leak checks complete",
+  "Cabin pressure stable",
+  "Commander requests final go poll",
+]
+
+export function CrewComms({ channel }: CrewCommsProps) {
+  return (
+    <section className="rounded-lg border p-4">
+      <p className="text-xs uppercase tracking-wide text-muted-foreground">
+        Crew loop · {channel}
+      </p>
+      <ul className="mt-3 space-y-2 text-sm">
+        {messages.map((message) => (
+          <li key={message} className="rounded-md bg-muted px-3 py-2">
+            {message}
+          </li>
+        ))}
+      </ul>
+    </section>
+  )
+}
diff --git a/components/status-strip.tsx b/components/status-strip.tsx
index 6f43b0c..c82ea79 100644
--- a/components/status-strip.tsx
+++ b/components/status-strip.tsx
@@ -1,11 +1,18 @@
-export function StatusStrip() {
+type StatusStripProps = {
+  compact?: boolean
+}
+
+export function StatusStrip({ compact = false }: StatusStripProps) {
   return (
-    <section className="flex items-center gap-3 rounded-lg border p-3">
+    <section className="flex items-center gap-2 rounded-lg border p-2 text-sm">
       <strong>Systems nominal</strong>
-      <span>Fuel stable</span>
-      <span>Telemetry online</span>
+      {!compact ? <span>Fuel stable</span> : null}
+      <span>Telemetry online</span>
+      <span className="ml-auto text-muted-foreground">Crew go</span>
     </section>
   )
 }
diff --git a/components/launch-timeline.tsx b/components/launch-timeline.tsx
index e038ce5..bcdb09e 100644
--- a/components/launch-timeline.tsx
+++ b/components/launch-timeline.tsx
@@ -1,9 +1,17 @@
-export function LaunchTimeline() {
+type LaunchTimelineProps = {
+  showAbortChecks?: boolean
+}
+
+export function LaunchTimeline({ showAbortChecks = false }: LaunchTimelineProps) {
   return (
     <ol className="rounded-lg border p-4">
       <li>T-20 fuel load</li>
       <li>T-10 terminal count</li>
+      {showAbortChecks ? <li>T-7 abort modes armed</li> : null}
       <li>T-0 ignition</li>
     </ol>
   )
 }
`,
  `diff --git a/app/mission-control/page.tsx b/app/mission-control/page.tsx
index 2a8f410..f704e91 100644
--- a/app/mission-control/page.tsx
+++ b/app/mission-control/page.tsx
@@ -1,16 +1,31 @@
 import { LaunchTimeline } from "@/components/launch-timeline"
 import { MissionMap } from "@/components/mission-map"
 import { StatusStrip } from "@/components/status-strip"
+import { AnomalyDeck } from "@/components/anomaly-deck"
+import { recordMissionView } from "@/lib/mission-audit"
 
-export default function MissionControlPage() {
+export default async function MissionControlPage() {
+  await recordMissionView("mission-control")
+
   return (
-    <main className="grid gap-4 p-6">
-      <StatusStrip />
-      <div className="grid grid-cols-[1fr_360px] gap-4">
-        <MissionMap />
-        <LaunchTimeline />
+    <main className="grid min-h-screen gap-4 p-6">
+      <StatusStrip alertCount={2} />
+      <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-4">
+        <div className="grid gap-4">
+          <MissionMap mode="risk" />
+          <AnomalyDeck severity="watch" />
+        </div>
+        <LaunchTimeline highlight="hold-points" />
       </div>
     </main>
   )
 }
diff --git a/components/anomaly-deck.tsx b/components/anomaly-deck.tsx
new file mode 100644
index 0000000..34b6b6f
--- /dev/null
+++ b/components/anomaly-deck.tsx
@@ -0,0 +1,24 @@
+type AnomalyDeckProps = {
+  severity: "watch" | "abort"
+}
+
+const anomalies = [
+  "Booster hydraulic temp rising",
+  "Downrange camera packet loss",
+]
+
+export function AnomalyDeck({ severity }: AnomalyDeckProps) {
+  return (
+    <section className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-4">
+      <div className="flex items-center justify-between">
+        <p className="text-sm font-semibold">Anomaly watch</p>
+        <span className="rounded-full bg-amber-300 px-2 py-0.5 text-xs text-amber-950">
+          {severity}
+        </span>
+      </div>
+      <ul className="mt-3 list-disc pl-5 text-sm">
+        {anomalies.map((item) => <li key={item}>{item}</li>)}
+      </ul>
+    </section>
+  )
+}
diff --git a/components/status-strip.tsx b/components/status-strip.tsx
index 6f43b0c..723acf4 100644
--- a/components/status-strip.tsx
+++ b/components/status-strip.tsx
@@ -1,11 +1,18 @@
-export function StatusStrip() {
+type StatusStripProps = {
+  alertCount?: number
+}
+
+export function StatusStrip({ alertCount = 0 }: StatusStripProps) {
   return (
-    <section className="flex items-center gap-3 rounded-lg border p-3">
+    <section className="flex items-center gap-3 rounded-lg border border-amber-400/35 p-3">
       <strong>Systems nominal</strong>
       <span>Fuel stable</span>
       <span>Telemetry online</span>
+      {alertCount > 0 ? (
+        <span className="ml-auto rounded-full bg-amber-300 px-2 py-0.5 text-xs text-amber-950">
+          {alertCount} watches
+        </span>
+      ) : null}
     </section>
   )
 }
diff --git a/lib/mission-audit.ts b/lib/mission-audit.ts
new file mode 100644
index 0000000..ff2f088
--- /dev/null
+++ b/lib/mission-audit.ts
@@ -0,0 +1,10 @@
+export async function recordMissionView(surface: string) {
+  console.info("mission.view", {
+    surface,
+    at: new Date().toISOString(),
+  })
+}
`,
];

const samplePanes: Pane[] = [
  createPane("a", normalizePatchInput(samples[0]), "launch-weather.patch"),
  createPane("b", normalizePatchInput(samples[1]), "crew-loop.patch"),
  createPane("c", normalizePatchInput(samples[2]), "risk-watch.patch"),
];

export function createSamplePanes(): Pane[] {
  return samplePanes.map((pane) => ({ ...pane }));
}

export function createEmptyPanes(count = 3): Pane[] {
  return LANE_ORDER.slice(0, count).map((id) => createPane(id));
}
