import { createPane, normalizePatchInput } from "./diff-data"
import type { Pane } from "./types"
import { LANE_ORDER } from "./lanes"

const samples = [
  `diff --git a/app/api/search/route.ts b/app/api/search/route.ts
index 8a44ad2..95cf810 100644
--- a/app/api/search/route.ts
+++ b/app/api/search/route.ts
@@ -1,13 +1,19 @@
 import { NextResponse } from "next/server"

+const MAX_RESULTS = 50
+
 export async function GET(request: Request) {
   const { searchParams } = new URL(request.url)
-  const query = searchParams.get("q")
+  const query = searchParams.get("q")?.trim()

   if (!query) {
-    return NextResponse.json({ error: "Missing query" }, { status: 400 })
+    return NextResponse.json({ results: [], total: 0 })
   }

-  const results = await search(query)
-  return NextResponse.json({ results })
+  const limit = Math.min(Number(searchParams.get("limit") ?? 20), MAX_RESULTS)
+  const results = await search(query, { limit })
+
+  return NextResponse.json({ results, total: results.length })
 }
diff --git a/components/result-list.tsx b/components/result-list.tsx
index 5f99c24..80aa613 100644
--- a/components/result-list.tsx
+++ b/components/result-list.tsx
@@ -7,7 +7,13 @@ export function ResultList({ results }: Props) {
   return (
     <div>
       {results.map((result) => (
-        <ResultItem key={result.id} result={result} />
+        <ResultItem
+          key={result.id}
+          result={result}
+          density="compact"
+          showScore
+        />
       ))}
     </div>
   )
`,
  `diff --git a/app/api/search/route.ts b/app/api/search/route.ts
index 8a44ad2..1783eaa 100644
--- a/app/api/search/route.ts
+++ b/app/api/search/route.ts
@@ -1,13 +1,28 @@
 import { NextResponse } from "next/server"
+import { z } from "zod"
+
+const schema = z.object({
+  q: z.string().trim().min(1),
+  limit: z.coerce.number().int().min(1).max(100).default(25),
+})

 export async function GET(request: Request) {
   const { searchParams } = new URL(request.url)
-  const query = searchParams.get("q")
+  const parsed = schema.safeParse(Object.fromEntries(searchParams))

-  if (!query) {
-    return NextResponse.json({ error: "Missing query" }, { status: 400 })
+  if (!parsed.success) {
+    return NextResponse.json(
+      { error: "Invalid search parameters" },
+      { status: 422 },
+    )
   }

-  const results = await search(query)
-  return NextResponse.json({ results })
+  const startedAt = performance.now()
+  const results = await search(parsed.data.q, { limit: parsed.data.limit })
+
+  return NextResponse.json({
+    results,
+    total: results.length,
+    tookMs: Math.round(performance.now() - startedAt),
+  })
 }
diff --git a/lib/search.ts b/lib/search.ts
index 21f1fb3..5610fd7 100644
--- a/lib/search.ts
+++ b/lib/search.ts
@@ -1,5 +1,10 @@
-export async function search(query: string) {
+type SearchOptions = { limit?: number }
+
+export async function search(query: string, options: SearchOptions = {}) {
   const response = await fetchSearchIndex()
-  return response.filter((item) => item.title.includes(query))
+  return response
+    .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
+    .slice(0, options.limit ?? 25)
 }
`,
  `diff --git a/app/api/search/route.ts b/app/api/search/route.ts
index 8a44ad2..c7db428 100644
--- a/app/api/search/route.ts
+++ b/app/api/search/route.ts
@@ -1,13 +1,24 @@
 import { NextResponse } from "next/server"
+import { getSession } from "@/lib/auth"

 export async function GET(request: Request) {
+  const session = await getSession()
+  if (!session) {
+    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
+  }
+
   const { searchParams } = new URL(request.url)
-  const query = searchParams.get("q")
+  const query = searchParams.get("q")?.trim()

   if (!query) {
     return NextResponse.json({ error: "Missing query" }, { status: 400 })
   }

-  const results = await search(query)
-  return NextResponse.json({ results })
+  const results = await search(query, {
+    organizationId: session.organizationId,
+  })
+
+  return NextResponse.json({ results, scoped: true })
 }
diff --git a/lib/audit.ts b/lib/audit.ts
new file mode 100644
index 0000000..d8c0b8a
--- /dev/null
+++ b/lib/audit.ts
@@ -0,0 +1,9 @@
+export function auditSearch(userId: string, query: string) {
+  return {
+    type: "search",
+    userId,
+    queryLength: query.length,
+    at: new Date().toISOString(),
+  } as const
+}
`,
]

const samplePanes: Pane[] = [
  createPane("a", normalizePatchInput(samples[0]), "validation.patch"),
  createPane("b", normalizePatchInput(samples[1]), "schema.patch"),
  createPane("c", normalizePatchInput(samples[2]), "auth.patch"),
]

export function createSamplePanes(): Pane[] {
  return samplePanes.map((pane) => ({ ...pane }))
}

export function createEmptyPanes(count = 3): Pane[] {
  return LANE_ORDER.slice(0, count).map((id) => createPane(id))
}
