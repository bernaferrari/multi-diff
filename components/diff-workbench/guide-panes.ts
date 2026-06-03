import { createPane, normalizePatchInput } from "./diff-data";
import type { Pane } from "./types";

const guideSamples = [
  `diff --git a/src/search.ts b/src/search.ts
index 4ac18d2..a41c6e8 100644
--- a/src/search.ts
+++ b/src/search.ts
@@ -1,9 +1,12 @@
 export function search(items: string[], query: string) {
-  if (!query) return items
+  const normalized = query.trim().toLowerCase()
+  if (!normalized) return []
 
   return items.filter((item) =>
-    item.includes(query)
+    item.toLowerCase().includes(normalized)
   )
 }
 
-export const resultLimit = 20
+export const resultLimit = 50
`,
  `diff --git a/src/search.ts b/src/search.ts
index 4ac18d2..d1d864b 100644
--- a/src/search.ts
+++ b/src/search.ts
@@ -1,9 +1,15 @@
 export function search(items: string[], query: string) {
-  if (!query) return items
+  if (query.length < 2) return []
 
-  return items.filter((item) =>
-    item.includes(query)
-  )
+  return items
+    .filter((item) => item.includes(query))
+    .slice(0, resultLimit)
 }
 
 export const resultLimit = 20
+
+export function describeSearch(query: string) {
+  return \`Searching for \${query}\`
+}
`,
  `diff --git a/src/search.ts b/src/search.ts
index 4ac18d2..60b61c8 100644
--- a/src/search.ts
+++ b/src/search.ts
@@ -1,9 +1,13 @@
-export function search(items: string[], query: string) {
+import { auditSearch } from "./telemetry"
+
+export function search(items: string[], query: string, userId: string) {
   if (!query) return items
+  auditSearch(userId, query)
 
   return items.filter((item) =>
     item.includes(query)
   )
 }
 
 export const resultLimit = 20
diff --git a/src/telemetry.ts b/src/telemetry.ts
new file mode 100644
index 0000000..3f2a982
--- /dev/null
+++ b/src/telemetry.ts
@@ -0,0 +1,5 @@
+export function auditSearch(userId: string, query: string) {
+  return {
+    userId,
+    length: query.length,
+  }
+}
`,
];

const guidePanes: Pane[] = [
  createPane("a", normalizePatchInput(guideSamples[0]), "guide-precision.patch"),
  createPane("b", normalizePatchInput(guideSamples[1]), "guide-limit.patch"),
  createPane("c", normalizePatchInput(guideSamples[2]), "guide-audit.patch"),
];

export const GUIDE_NOTES = `Guide

A, B, and C are three competing patches against the same small search module.

Start with src/search.ts. In columns mode, scan left to right to compare intent: A normalizes input, B limits results, and C adds telemetry.

Use the file tree to jump between files. C also adds src/telemetry.ts, so it appears only in that lane.

Try Search for "query" or "resultLimit", then switch between Unified and Split to see which view is easier for the decision.`;

export function createGuidePanes(): Pane[] {
  return guidePanes.map((pane) => ({ ...pane }));
}
