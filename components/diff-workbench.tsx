"use client"

import { parsePatchFiles } from "@pierre/diffs"
import {
  CodeView,
  type CodeViewHandle,
  type CodeViewItem,
  FileDiff,
  type FileDiffMetadata,
} from "@pierre/diffs/react"
import {
  createFileTreeIconResolver,
  getBuiltInSpriteSheet,
} from "@pierre/trees"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import {
  AlignLeft,
  ChevronLeft,
  Check,
  Clipboard,
  Columns3,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Folder,
  FolderOpen,
  Hash,
  Link2,
  MoreHorizontal,
  Minus,
  Moon,
  PanelLeft,
  RotateCcw,
  Rows3,
  Search,
  SlidersHorizontal,
  SplitSquareHorizontal,
  StickyNote,
  Sun,
  Trash2,
  Upload,
  WrapText,
} from "lucide-react"
import { type ReactElement, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type LaneId = string

type Pane = {
  id: LaneId
  label: string
  text: string
  filename?: string
}

type ParsedPane = Pane & {
  items: CodeViewItem[]
  files: FileDiffMetadata[]
  error?: string
  additions: number
  deletions: number
}

type PaneView = {
  id: LaneId
  files: FileDiffMetadata[]
  items: CodeViewItem[]
  idByName: Map<string, string>
  additions: number
  deletions: number
}

type FileRow = {
  name: string
  panes: Partial<Record<LaneId, FileDiffMetadata>>
  presentIn: LaneId[]
  additions: number
  deletions: number
}

type FileTreeNode = {
  children: Map<string, FileTreeNode>
  kind: "directory" | "file"
  name: string
  path: string
  row?: FileRow
  summary?: FileRow
}

type VisibleFileTreeRow = {
  depth: number
  node: FileTreeNode
}

type LaneStyle = {
  text: string
  dot: string
  bar: string
  soft: string
  border: string
}

const MAX_LANES = 5
const LANE_ORDER: LaneId[] = ["a", "b", "c", "d", "e"]
const TREE_ICON_SPRITE = getBuiltInSpriteSheet("complete")
const TREE_ICON_RESOLVER = createFileTreeIconResolver({
  set: "complete",
  colored: true,
})

const LANE_STYLES: LaneStyle[] = [
  {
    text: "text-lane-a",
    dot: "bg-lane-a",
    bar: "bg-lane-a",
    soft: "bg-lane-a/10",
    border: "border-lane-a/40",
  },
  {
    text: "text-lane-b",
    dot: "bg-lane-b",
    bar: "bg-lane-b",
    soft: "bg-lane-b/10",
    border: "border-lane-b/40",
  },
  {
    text: "text-lane-c",
    dot: "bg-lane-c",
    bar: "bg-lane-c",
    soft: "bg-lane-c/10",
    border: "border-lane-c/40",
  },
  {
    text: "text-lane-d",
    dot: "bg-lane-d",
    bar: "bg-lane-d",
    soft: "bg-lane-d/10",
    border: "border-lane-d/40",
  },
  {
    text: "text-lane-e",
    dot: "bg-lane-e",
    bar: "bg-lane-e",
    soft: "bg-lane-e/10",
    border: "border-lane-e/40",
  },
]

const STORAGE_KEY = "sf-diff:v1"

function laneIndex(id: LaneId) {
  const index = LANE_ORDER.indexOf(id)
  return index >= 0 ? index : 0
}

function laneIdAt(index: number) {
  return LANE_ORDER[index] ?? LANE_ORDER[0]
}

function laneLabel(id: LaneId) {
  return id.toUpperCase()
}

function laneTitle(id: LaneId) {
  return `Diff ${laneLabel(id)}`
}

function laneStyle(id: LaneId) {
  return LANE_STYLES[laneIndex(id) % LANE_STYLES.length]
}

function createPane(id: LaneId, text = "", filename?: string): Pane {
  return {
    id,
    label: laneTitle(id),
    text,
    filename,
  }
}

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
index 0000000..55dcacd
--- /dev/null
+++ b/lib/audit.ts
@@ -0,0 +1,7 @@
+export function auditSearch(userId: string, query: string) {
+  return console.info("search", {
+    userId,
+    queryLength: query.length,
+    at: new Date().toISOString(),
+  })
+}
`,
]

const initialPanes: Pane[] = [
  createPane("a", normalizePatchInput(samples[0]), "validation.patch"),
  createPane("b", normalizePatchInput(samples[1]), "schema.patch"),
  createPane("c", normalizePatchInput(samples[2]), "auth.patch"),
]

function normalizePatchInput(patch: string) {
  return patch
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => (line === "" ? " " : line))
    .join("\n")
}

function itemId(paneId: string, fileName: string, index = 0) {
  return `${paneId}-${index}-${fileName}`
}

function additionsFor(file: FileDiffMetadata) {
  return file.hunks.reduce((sum, hunk) => sum + hunk.additionLines, 0)
}

function deletionsFor(file: FileDiffMetadata) {
  return file.hunks.reduce((sum, hunk) => sum + hunk.deletionLines, 0)
}

function parsePane(pane: Pane): ParsedPane {
  if (!pane.text.trim()) {
    return { ...pane, items: [], files: [], additions: 0, deletions: 0 }
  }
  try {
    const patches = parsePatchFiles(
      normalizePatchInput(pane.text),
      pane.id,
      true
    )
    const files = patches.flatMap((patch) => patch.files)
    const items = files.map((fileDiff, index) => ({
      id: itemId(pane.id, fileDiff.name, index),
      type: "diff" as const,
      fileDiff,
    }))
    const additions = files.reduce((t, f) => t + additionsFor(f), 0)
    const deletions = files.reduce((t, f) => t + deletionsFor(f), 0)
    return { ...pane, items, files, additions, deletions }
  } catch (error) {
    return {
      ...pane,
      items: [],
      files: [],
      additions: 0,
      deletions: 0,
      error: error instanceof Error ? error.message : "Could not parse diff",
    }
  }
}

function buildFileRows(panes: ParsedPane[]): FileRow[] {
  const rows = new Map<string, FileRow>()
  for (const pane of panes) {
    for (const file of pane.files) {
      const existing = rows.get(file.name) ?? {
        name: file.name,
        panes: {},
        presentIn: [],
        additions: 0,
        deletions: 0,
      }
      existing.panes[pane.id] = file
      existing.presentIn.push(pane.id)
      existing.additions += additionsFor(file)
      existing.deletions += deletionsFor(file)
      rows.set(file.name, existing)
    }
  }
  return Array.from(rows.values()).sort((a, b) => {
    const shared = b.presentIn.length - a.presentIn.length
    if (shared !== 0) return shared
    return b.additions + b.deletions - (a.additions + a.deletions)
  })
}

function createTreeNode(
  kind: FileTreeNode["kind"],
  name: string,
  path: string,
  row?: FileRow
): FileTreeNode {
  return { children: new Map(), kind, name, path, row }
}

function buildVisibleFileTreeRows(
  rows: FileRow[],
  collapsedPaths: Set<string>
): VisibleFileTreeRow[] {
  const root = createTreeNode("directory", "", "")

  for (const row of rows) {
    const parts = row.name.split("/").filter(Boolean)
    let cursor = root
    let path = ""

    parts.forEach((part, index) => {
      path = path ? `${path}/${part}` : part
      const isFile = index === parts.length - 1
      const existing = cursor.children.get(part)
      const next =
        existing ??
        createTreeNode(
          isFile ? "file" : "directory",
          part,
          path,
          isFile ? row : undefined
        )

      if (isFile) {
        next.kind = "file"
        next.row = row
      }

      cursor.children.set(part, next)
      cursor = next
    })
  }

  const visible: VisibleFileTreeRow[] = []

  function sortedChildren(node: FileTreeNode) {
    return [...node.children.values()].sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }

  function compactDirectory(node: FileTreeNode): FileTreeNode {
    if (node.kind !== "directory") return node

    for (const [key, child] of node.children) {
      node.children.set(key, compactDirectory(child))
    }

    while (node.children.size === 1) {
      const only = [...node.children.values()][0]
      if (only?.kind !== "directory") break
      node = {
        ...only,
        name: node.name ? `${node.name}/${only.name}` : only.name,
      }
    }

    return node
  }

  function summarize(node: FileTreeNode): FileRow | undefined {
    if (node.kind === "file") {
      node.summary = node.row
      return node.row
    }

    const summary: FileRow = {
      name: node.path,
      panes: {},
      presentIn: [],
      additions: 0,
      deletions: 0,
    }
    const present = new Set<LaneId>()

    for (const child of node.children.values()) {
      const childSummary = summarize(child)
      if (!childSummary) continue
      summary.additions += childSummary.additions
      summary.deletions += childSummary.deletions
      for (const lane of childSummary.presentIn) {
        present.add(lane)
        summary.panes[lane] ??= childSummary.panes[lane]
      }
    }

    summary.presentIn = [...present]
    node.summary = summary
    return summary
  }

  summarize(root)

  function visit(node: FileTreeNode, depth: number) {
    for (const child of sortedChildren(node).map(compactDirectory)) {
      visible.push({ depth, node: child })
      if (child.kind === "directory" && !collapsedPaths.has(child.path)) {
        visit(child, depth + 1)
      }
    }
  }

  visit(root, 0)
  return visible
}

function collectFileTreeNames(node: FileTreeNode): string[] {
  if (node.kind === "file") return node.row ? [node.row.name] : []

  const names: string[] = []
  for (const child of node.children.values()) {
    names.push(...collectFileTreeNames(child))
  }
  return names
}

function estimateCodeHeight(view: PaneView) {
  if (view.files.length === 0) return 96

  return view.files.reduce((total, file) => {
    const changedLines = additionsFor(file) + deletionsFor(file)
    const hunkContext = Math.max(4, file.hunks.length * 6)
    const renderedLines = Math.max(6, changedLines + hunkContext)
    return total + 42 + renderedLines * 20
  }, 0)
}

function copyFilePath(path: string) {
  toast.success("Copied file path", {
    description: path,
  })
  void navigator.clipboard?.writeText(path).catch(() => {
    // clipboard blocked
  })
}

function routeWheelToScroller(event: React.WheelEvent, scroller: HTMLElement) {
  const horizontalDelta = event.shiftKey ? event.deltaY : event.deltaX
  const verticalDelta = event.shiftKey ? 0 : event.deltaY
  const preferHorizontal =
    Math.abs(horizontalDelta) > Math.abs(verticalDelta) ||
    (event.shiftKey && horizontalDelta !== 0)

  if (preferHorizontal) {
    const maxLeft = scroller.scrollWidth - scroller.clientWidth
    if (maxLeft <= 0) return

    const nextLeft = Math.min(
      Math.max(scroller.scrollLeft + horizontalDelta, 0),
      maxLeft
    )
    if (nextLeft === scroller.scrollLeft) return
    event.preventDefault()
    scroller.scrollLeft = nextLeft
    return
  }

  const maxTop = scroller.scrollHeight - scroller.clientHeight
  if (maxTop <= 0) return

  const nextTop = Math.min(
    Math.max(scroller.scrollTop + verticalDelta, 0),
    maxTop
  )
  if (nextTop === scroller.scrollTop) return
  event.preventDefault()
  scroller.scrollTop = nextTop
}

type Layout = "columns" | "rows"
type DiffStyle = "split" | "unified"

export function DiffWorkbench() {
  const { resolvedTheme } = useTheme()
  const codeTheme: "light" | "dark" =
    resolvedTheme === "dark" ? "dark" : "light"

  const [panes, setPanes] = useState<Pane[]>(initialPanes)
  const [layout, setLayout] = useState<Layout>("columns")
  const [diffStyle, setDiffStyle] = useState<DiffStyle>("unified")
  const [wrap, setWrap] = useState(true)
  const [lineNumbers, setLineNumbers] = useState(true)
  const [syncScroll, setSyncScroll] = useState(true)
  const [showFilenames, setShowFilenames] = useState(true)
  const [hidden, setHidden] = useState<Set<LaneId>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [fileQuery, setFileQuery] = useState("")
  const [focusFile, setFocusFile] = useState<string | null>(null)
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [hiddenFiles, setHiddenFiles] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState("")
  const [notesOpen, setNotesOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [dragging, setDragging] = useState(false)

  const viewerRefs = useRef<Record<string, CodeViewHandle<undefined> | null>>(
    {}
  )
  const syncing = useRef(false)
  const spyFile = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* Restore persisted session once on mount (SSR-safe: localStorage is only
   * available on the client). */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (Array.isArray(saved.panes)) {
          const restored = saved.panes
            .slice(0, MAX_LANES)
            .map((pane: Partial<Pane>, index: number) => {
              const id = laneIdAt(index)
              return {
                id,
                label: laneTitle(id),
                text: typeof pane.text === "string" ? pane.text : "",
                filename:
                  typeof pane.filename === "string" ? pane.filename : undefined,
              }
            })
          if (restored.length > 0) setPanes(restored)
        }
        if (typeof saved.notes === "string") setNotes(saved.notes)
        if (saved.layout) setLayout(saved.layout)
        if (saved.diffStyle) setDiffStyle(saved.diffStyle)
        if (typeof saved.wrap === "boolean") setWrap(saved.wrap)
        if (typeof saved.lineNumbers === "boolean")
          setLineNumbers(saved.lineNumbers)
        if (typeof saved.showFilenames === "boolean")
          setShowFilenames(saved.showFilenames)
        if (typeof saved.sidebarOpen === "boolean")
          setSidebarOpen(saved.sidebarOpen)
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          panes,
          notes,
          layout,
          diffStyle,
          wrap,
          lineNumbers,
          showFilenames,
          sidebarOpen,
        })
      )
    } catch {
      // ignore quota errors
    }
  }, [
    hydrated,
    panes,
    notes,
    layout,
    diffStyle,
    wrap,
    lineNumbers,
    showFilenames,
    sidebarOpen,
  ])

  const parsed = useMemo(() => panes.map(parsePane), [panes])
  const visiblePanes = useMemo(
    () => parsed.filter((pane) => !hidden.has(pane.id)),
    [parsed, hidden]
  )
  // The file list only reflects the lanes that are currently visible: hide a
  // lane and the files unique to it disappear from the navigator.
  const allFileRows = useMemo(() => buildFileRows(visiblePanes), [visiblePanes])
  const fileRows = useMemo(
    () => allFileRows.filter((row) => !hiddenFiles.has(row.name)),
    [allFileRows, hiddenFiles]
  )
  const hiddenFileRows = useMemo(
    () => allFileRows.filter((row) => hiddenFiles.has(row.name)),
    [allFileRows, hiddenFiles]
  )
  const fileNameSet = useMemo(
    () => new Set(fileRows.map((r) => r.name)),
    [fileRows]
  )

  // A focused file that no longer exists in any visible lane falls back to
  // overview (e.g. you focused a C-only file, then hid C).
  const focused = focusFile && fileNameSet.has(focusFile) ? focusFile : null
  const displayedPanes = useMemo(
    () =>
      focused
        ? visiblePanes.filter((pane) =>
            pane.files.some((file) => file.name === focused)
          )
        : visiblePanes,
    [focused, visiblePanes]
  )

  // Per-lane render plan — identical mapping used for both the CodeView and
  // for anchored sync, so item ids always line up.
  const paneViews = useMemo<Record<string, PaneView>>(() => {
    const out: Record<string, PaneView> = {}
    for (const pane of parsed) {
      const files = focused
        ? pane.files.filter((f) => f.name === focused)
        : pane.files.filter((f) => !hiddenFiles.has(f.name))
      const idByName = new Map<string, string>()
      const items = files.map((fileDiff, index) => {
        const id = itemId(pane.id, fileDiff.name, index)
        idByName.set(fileDiff.name, id)
        return { id, type: "diff" as const, fileDiff }
      })
      out[pane.id] = {
        id: pane.id,
        files,
        items,
        idByName,
        additions: files.reduce((t, f) => t + additionsFor(f), 0),
        deletions: files.reduce((t, f) => t + deletionsFor(f), 0),
      }
    }
    return out
  }, [parsed, focused, hiddenFiles])

  const contributing = visiblePanes.filter((p) =>
    p.files.some((file) => !hiddenFiles.has(file.name))
  ).length
  const sharedCount =
    contributing > 1
      ? fileRows.filter((r) => r.presentIn.length === contributing).length
      : 0
  const hasErrors = parsed.some((pane) => pane.error)
  const indexActiveFile = focused ?? activeFile

  function toggleLane(id: LaneId) {
    setHidden((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else if (next.size < panes.length - 1) next.add(id)
      return next
    })
  }

  function hideFiles(names: string[]) {
    const nameSet = new Set(names)
    if (nameSet.size === 0) return
    setHiddenFiles((cur) => new Set([...cur, ...nameSet]))
    setFocusFile((cur) => (cur && nameSet.has(cur) ? null : cur))
    setActiveFile((cur) => (cur && nameSet.has(cur) ? null : cur))
  }

  function showFiles(names: string[]) {
    const nameSet = new Set(names)
    if (nameSet.size === 0) return
    setHiddenFiles((cur) => {
      const next = new Set(cur)
      for (const name of nameSet) next.delete(name)
      return next
    })
  }

  function clearLane(id: LaneId) {
    setPanes((cur) =>
      cur.map((pane) =>
        pane.id === id ? { ...pane, text: "", filename: undefined } : pane
      )
    )
  }

  async function importFiles(fileList: FileList | null, target?: LaneId) {
    const files = Array.from(fileList ?? []).slice(0, MAX_LANES)
    if (!files.length) return
    const emptyIdx = panes.findIndex((p) => !p.text.trim())
    const start = target
      ? laneIndex(target)
      : files.length === 1 && emptyIdx >= 0
        ? emptyIdx
        : 0
    const reads = await Promise.all(
      files.map(async (file) => ({ name: file.name, text: await file.text() }))
    )
    setPanes((cur) => {
      const laneCount =
        target || reads.length === 1
          ? Math.max(cur.length, start + reads.length, 1)
          : reads.length
      const next = Array.from(
        { length: Math.min(laneCount, MAX_LANES) },
        (_, i) => {
          const id = laneIdAt(i)
          return cur[i]
            ? { ...cur[i], id, label: laneTitle(id) }
            : createPane(id)
        }
      )
      reads.forEach((read, i) => {
        const id = laneIdAt((start + i) % LANE_ORDER.length)
        const idx = next.findIndex((p) => p.id === id)
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            text: read.text,
            filename: read.name,
          }
        }
      })
      return next
    })
    setHidden(new Set())
    setHiddenFiles(new Set())
  }

  // Anchored sync: scrolling one lane re-aligns the others on whichever file
  // is currently at the top. Files unique to a lane just scroll on their own.
  function handleScroll(sourceId: LaneId) {
    const srcInst = viewerRefs.current[sourceId]?.getInstance()
    const srcView = paneViews[sourceId]
    if (!srcInst || !srcView || srcView.items.length === 0) return

    const scrollTop = srcInst.getScrollTop()
    const activationLine =
      scrollTop + Math.min(96, Math.max(32, srcInst.getHeight() * 0.28))
    let activeName: string | null = null
    let activeTop = 0
    for (const item of srcView.items) {
      const top = srcInst.getTopForItem(item.id)
      if (top == null) continue
      if (top <= activationLine) {
        if (item.type === "diff") {
          activeName = item.fileDiff.name
          activeTop = top
        }
      } else break
    }
    if (activeName == null && srcView.items[0]?.type === "diff") {
      activeName = srcView.items[0].fileDiff.name
      activeTop = srcInst.getTopForItem(srcView.items[0].id) ?? 0
    }
    if (activeName == null) return

    if (activeName !== spyFile.current) {
      spyFile.current = activeName
      setActiveFile(activeName)
    }
    // Throttle to one propagation per frame and ignore the scroll events that
    // our own scrollTo calls trigger on the target lanes.
    if (!syncScroll || syncing.current) return
    const intra = Math.max(0, scrollTop - activeTop)
    syncing.current = true
    for (const pane of displayedPanes) {
      if (pane.id === sourceId) continue
      const inst = viewerRefs.current[pane.id]?.getInstance()
      const targetId = paneViews[pane.id]?.idByName.get(activeName)
      if (!inst || !targetId) continue
      inst.scrollTo({
        type: "item",
        id: targetId,
        align: "start",
        offset: intra,
        behavior: "instant",
      })
    }
    requestAnimationFrame(() => {
      syncing.current = false
    })
  }

  function focusFileByOffset(delta: number) {
    if (fileRows.length === 0) return
    const current = focusFile ?? activeFile ?? fileRows[0].name
    const idx = fileRows.findIndex((r) => r.name === current)
    const next = fileRows[(idx + delta + fileRows.length) % fileRows.length]
    setFocusFile(next.name)
  }

  // Keyboard: n = notes, esc = leave focus, ←/→ = move focus between files.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return
      const t = e.target
      if (
        t instanceof HTMLElement &&
        (t.isContentEditable ||
          t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA")
      )
        return
      const key = e.key.toLowerCase()
      if (key === "n") setNotesOpen((v) => !v)
      else if (e.key === "Escape" && focusFile) setFocusFile(null)
      else if (focusFile && e.key === "ArrowRight") focusFileByOffset(1)
      else if (focusFile && e.key === "ArrowLeft") focusFileByOffset(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusFile, activeFile, fileRows])

  // Global drag & drop — drop anywhere to import.
  useEffect(() => {
    let depth = 0
    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files")
    function onEnter(e: DragEvent) {
      if (!hasFiles(e)) return
      depth += 1
      setDragging(true)
    }
    function onLeave(e: DragEvent) {
      if (!hasFiles(e)) return
      depth = Math.max(0, depth - 1)
      if (depth === 0) setDragging(false)
    }
    function onOver(e: DragEvent) {
      if (hasFiles(e)) e.preventDefault()
    }
    function onDrop(e: DragEvent) {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setDragging(false)
      const laneAttr = (e.target as HTMLElement)?.closest?.("[data-lane]")
      const target = laneAttr?.getAttribute("data-lane") as LaneId | null
      void importFiles(e.dataTransfer?.files ?? null, target ?? undefined)
    }
    window.addEventListener("dragenter", onEnter)
    window.addEventListener("dragleave", onLeave)
    window.addEventListener("dragover", onOver)
    window.addEventListener("drop", onDrop)
    return () => {
      window.removeEventListener("dragenter", onEnter)
      window.removeEventListener("dragleave", onLeave)
      window.removeEventListener("dragover", onOver)
      window.removeEventListener("drop", onDrop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panes])

  const columnsTemplate = `repeat(${Math.max(1, displayedPanes.length)}, minmax(0, 1fr))`

  function handleRowsWheel(event: React.WheelEvent<HTMLElement>) {
    if (layout !== "rows") return
    routeWheelToScroller(event, event.currentTarget)
  }

  return (
    <main className="bg-grid flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <input
        ref={fileInputRef}
        type="file"
        accept=".diff,.patch,.txt"
        multiple
        className="sr-only"
        onChange={(e) => {
          void importFiles(e.target.files)
          e.target.value = ""
        }}
      />

      <Toolbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        layout={layout}
        setLayout={setLayout}
        diffStyle={diffStyle}
        setDiffStyle={setDiffStyle}
        wrap={wrap}
        setWrap={setWrap}
        lineNumbers={lineNumbers}
        setLineNumbers={setLineNumbers}
        syncScroll={syncScroll}
        setSyncScroll={setSyncScroll}
        showFilenames={showFilenames}
        setShowFilenames={setShowFilenames}
        onImport={() => fileInputRef.current?.click()}
        onReset={() => {
          setPanes(initialPanes)
          setHidden(new Set())
          setHiddenFiles(new Set())
          setFocusFile(null)
        }}
      />

      <div
        className={cn(
          "grid min-h-0 flex-1 transition-[grid-template-columns] duration-[240ms] ease-in-out motion-reduce:transition-none",
          sidebarOpen
            ? "grid-cols-[16rem_minmax(0,1fr)]"
            : "grid-cols-[0rem_minmax(0,1fr)]"
        )}
      >
        <div className="min-w-0 overflow-hidden">
          <div
            className={cn(
              "h-full transition-[opacity,transform] duration-[240ms] ease-in-out motion-reduce:transition-none",
              sidebarOpen
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-3 opacity-0"
            )}
          >
            <FilesPanel
              rows={allFileRows}
              hiddenFileRows={hiddenFileRows}
              hiddenFiles={hiddenFiles}
              panes={parsed}
              hidden={hidden}
              focusFile={focused}
              activeFile={indexActiveFile}
              query={fileQuery}
              sharedCount={sharedCount}
              onQuery={setFileQuery}
              onToggleLane={toggleLane}
              onHideFiles={hideFiles}
              onShowFiles={showFiles}
              onShowAllFiles={() => setHiddenFiles(new Set())}
              onOverview={() => setFocusFile(null)}
              onFocus={(name) =>
                setFocusFile((cur) => (cur === name ? null : name))
              }
            />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {hasErrors ? (
            <div className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-1.5 text-xs text-destructive">
              One or more inputs could not be parsed as a unified diff.
            </div>
          ) : null}

          <section
            className={cn(
              "min-h-0 flex-1",
              layout === "columns"
                ? "h-full overflow-hidden p-3"
                : "scroll-thin overflow-y-auto px-3 pt-3 pb-3"
            )}
            onWheelCapture={handleRowsWheel}
          >
            {displayedPanes.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">
                {visiblePanes.length === 0
                  ? "All lanes hidden — re-enable one from the chips above."
                  : "No visible lane modifies this file."}
              </div>
            ) : (
              <div
                className={cn(
                  layout === "columns"
                    ? "grid h-full min-h-0 gap-3"
                    : "flex flex-col gap-3"
                )}
                style={
                  layout === "columns"
                    ? { gridTemplateColumns: columnsTemplate }
                    : undefined
                }
              >
                {displayedPanes.map((pane) => (
                  <Lane
                    key={pane.id}
                    pane={pane}
                    view={paneViews[pane.id]}
                    layout={layout}
                    diffStyle={diffStyle}
                    wrap={wrap}
                    lineNumbers={lineNumbers}
                    showFilenames={showFilenames}
                    codeTheme={codeTheme}
                    refCallback={(handle) => {
                      viewerRefs.current[pane.id] = handle
                    }}
                    onScroll={() => handleScroll(pane.id)}
                    onHide={() => toggleLane(pane.id)}
                    onImport={(files) => void importFiles(files, pane.id)}
                    onClear={() => clearLane(pane.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Notepad
        open={notesOpen}
        value={notes}
        onChange={setNotes}
        onOpen={() => setNotesOpen(true)}
        onClose={() => setNotesOpen(false)}
      />

      {dragging ? <DropOverlay /> : null}
    </main>
  )
}

/* --------------------------------------------------------------- Toolbar */

function Toolbar(props: {
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  layout: Layout
  setLayout: (l: Layout) => void
  diffStyle: DiffStyle
  setDiffStyle: (s: DiffStyle) => void
  wrap: boolean
  setWrap: (v: boolean) => void
  lineNumbers: boolean
  setLineNumbers: (v: boolean) => void
  syncScroll: boolean
  setSyncScroll: (v: boolean) => void
  showFilenames: boolean
  setShowFilenames: (v: boolean) => void
  onImport: () => void
  onReset: () => void
}) {
  return (
    <header className="z-20 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 bg-card/80 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => props.setSidebarOpen(!props.sidebarOpen)}
          aria-pressed={props.sidebarOpen}
          aria-label={
            props.sidebarOpen ? "Hide files panel" : "Show files panel"
          }
          className={cn(
            "-ml-1 grid size-8 place-items-center rounded-md transition-colors hover:bg-muted",
            props.sidebarOpen
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PanelLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold tracking-tight">Juxta</span>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <Segmented>
          <Seg
            active={props.layout === "columns"}
            onClick={() => props.setLayout("columns")}
            icon={<Columns3 className="size-3.5" />}
            label="Columns"
          />
          <Seg
            active={props.layout === "rows"}
            onClick={() => props.setLayout("rows")}
            icon={<Rows3 className="size-3.5" />}
            label="Rows"
          />
        </Segmented>

        <Segmented>
          <Seg
            active={props.diffStyle === "unified"}
            onClick={() => props.setDiffStyle("unified")}
            icon={<AlignLeft className="size-3.5" />}
            label="Unified"
          />
          <Seg
            active={props.diffStyle === "split"}
            onClick={() => props.setDiffStyle("split")}
            icon={<SplitSquareHorizontal className="size-3.5" />}
            label="Split"
          />
        </Segmented>

        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                aria-label="Display options"
                title="Display options"
                className="grid size-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground"
              >
                <SlidersHorizontal className="size-4" />
              </button>
            }
          />
          <PopoverContent align="end" sideOffset={8} className="w-72 gap-3 p-3">
            <PopoverHeader className="gap-1 border-b border-border/70 pb-2">
              <PopoverTitle className="flex items-center gap-2 text-sm">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                Display
              </PopoverTitle>
              <PopoverDescription className="text-xs">
                Tune how diffs are rendered.
              </PopoverDescription>
            </PopoverHeader>

            <div className="grid gap-1">
              <DisplaySwitch
                checked={props.wrap}
                description="Keep long lines inside the panel."
                icon={<WrapText className="size-4" />}
                label="Wrap lines"
                onCheckedChange={props.setWrap}
              />
              <DisplaySwitch
                checked={props.lineNumbers}
                description="Show original and modified line positions."
                icon={<Hash className="size-4" />}
                label="Line numbers"
                onCheckedChange={props.setLineNumbers}
              />
              <DisplaySwitch
                checked={props.showFilenames}
                description="Show filename bars inside each diff."
                icon={<FileText className="size-4" />}
                label="File headers"
                onCheckedChange={props.setShowFilenames}
              />
              <DisplaySwitch
                checked={props.syncScroll}
                description="Keep matching files aligned while scrolling."
                icon={<Link2 className="size-4" />}
                label="Sync scroll"
                onCheckedChange={props.setSyncScroll}
              />
            </div>
          </PopoverContent>
        </Popover>

        <div className="mx-0.5 h-6 w-px bg-border" />

        <AppTooltip label="Import or paste diff files">
          <Button
            size="sm"
            onClick={props.onImport}
            title="Import or paste diff files"
          >
            <Upload className="size-3.5" />
            Import
          </Button>
        </AppTooltip>
        <AppTooltip label="Reload sample diffs">
          <button
            type="button"
            onClick={props.onReset}
            aria-label="Reload sample diffs"
            className="grid size-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="size-4" />
          </button>
        </AppTooltip>
        <ThemeToggle />
      </div>
    </header>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect -- avoid SSR icon mismatch
  useEffect(() => setMounted(true), [])
  return (
    <AppTooltip label="Toggle theme (d)">
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="grid size-8 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {mounted && resolvedTheme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </button>
    </AppTooltip>
  )
}

function Segmented({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background p-0.5">
      {children}
    </div>
  )
}

function Seg({
  active,
  onClick,
  icon,
  label,
  tooltip,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  tooltip?: string
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={tooltip}
      className={cn(
        "flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  )

  return tooltip ? <AppTooltip label={tooltip}>{button}</AppTooltip> : button
}

function AppTooltip({
  label,
  children,
}: {
  label: string
  children: ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function DisplaySwitch({
  checked,
  description,
  icon,
  label,
  onCheckedChange,
}: {
  checked: boolean
  description: string
  icon: React.ReactNode
  label: string
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/65">
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border",
          checked
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-border bg-background text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-none font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-snug text-muted-foreground">
          {description}
        </span>
      </span>
      <Switch
        checked={checked}
        className="self-center"
        onCheckedChange={onCheckedChange}
        size="sm"
      />
    </label>
  )
}

/* ------------------------------------------------------------ FilesPanel */

function FilesPanel({
  rows,
  hiddenFileRows,
  hiddenFiles,
  panes,
  hidden,
  focusFile,
  activeFile,
  query,
  sharedCount,
  onQuery,
  onToggleLane,
  onHideFiles,
  onShowFiles,
  onShowAllFiles,
  onOverview,
  onFocus,
}: {
  rows: FileRow[]
  hiddenFileRows: FileRow[]
  hiddenFiles: Set<string>
  panes: ParsedPane[]
  hidden: Set<LaneId>
  focusFile: string | null
  activeFile: string | null
  query: string
  sharedCount: number
  onQuery: (q: string) => void
  onToggleLane: (id: LaneId) => void
  onHideFiles: (names: string[]) => void
  onShowFiles: (names: string[]) => void
  onShowAllFiles: () => void
  onOverview: () => void
  onFocus: (name: string) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const [contextFile, setContextFile] = useState<string | null>(null)
  const [contextDirectory, setContextDirectory] = useState<{
    label: string
    names: string[]
  } | null>(null)
  const [collapsedDirs, setCollapsedDirs] = useState<Set<string>>(new Set())
  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) => {
      const filename = row.name.split("/").pop() ?? row.name
      return filename.toLowerCase().includes(needle)
    })
  }, [query, rows])
  const treeRows = useMemo(
    () => buildVisibleFileTreeRows(filteredRows, collapsedDirs),
    [filteredRows, collapsedDirs]
  )
  const laneIds = useMemo(() => panes.map((pane) => pane.id), [panes])
  const treeLaneIds = useMemo(
    () => laneIds.filter((id) => !hidden.has(id)),
    [hidden, laneIds]
  )
  const showTreeLaneBadges = query.trim().length !== 1 && treeLaneIds.length > 1
  const visibleCount = rows.length - hiddenFileRows.length
  const restorableRows = hiddenFileRows.filter(
    (row) => row.name !== contextFile
  )

  useEffect(() => {
    if (!activeFile) return
    const el = listRef.current?.querySelector<HTMLElement>("[data-active]")
    el?.scrollIntoView({ block: "nearest" })
  }, [activeFile, treeRows])

  function toggleDirectory(path: string) {
    setCollapsedDirs((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border/70 bg-card/40">
      <span
        aria-hidden
        className="hidden"
        dangerouslySetInnerHTML={{ __html: TREE_ICON_SPRITE }}
      />
      <div className="flex flex-col gap-2 border-b border-border/70 p-2.5">
        {/* Lane visibility */}
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, laneIds.length)}, minmax(0, 1fr))`,
          }}
        >
          {panes.map((pane) => {
            const style = laneStyle(pane.id)
            const isHidden = hidden.has(pane.id)
            return (
              <button
                key={pane.id}
                type="button"
                onClick={() => onToggleLane(pane.id)}
                title={isHidden ? `Show ${pane.label}` : `Hide ${pane.label}`}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-1 text-xs font-medium transition-all",
                  isHidden
                    ? "border-dashed border-border text-muted-foreground/50"
                    : cn("border-transparent", style.soft, style.text)
                )}
              >
                <span>{laneLabel(pane.id)}</span>
                {isHidden ? <EyeOff className="size-3" /> : null}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Filter files…"
            spellCheck={false}
            className="h-8 w-full rounded-md border border-border bg-background pr-2 pl-8 text-xs transition-colors outline-none focus:border-ring"
          />
        </div>
      </div>

      {/* Tree section header — turns into a back link while focused */}
      <div className="flex h-7 items-center gap-2 px-3 pt-2 pb-1">
        {focusFile ? (
          <button
            type="button"
            onClick={onOverview}
            className="-ml-0.5 flex h-4 items-center gap-0.5 rounded px-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-3" />
            All files
          </button>
        ) : (
          <>
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
              Files
            </span>
            <span
              title={
                sharedCount > 0
                  ? `${sharedCount} file${sharedCount === 1 ? "" : "s"} changed in every lane`
                  : undefined
              }
              className="grid h-4 min-w-4 place-items-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground tabular-nums"
            >
              {visibleCount}
            </span>
          </>
        )}
      </div>

      {/* File tree */}
      <ContextMenu>
        <ContextMenuTrigger
          render={
            <div
              ref={listRef}
              className="scroll-thin min-h-0 flex-1 overflow-y-auto p-1.5"
              onContextMenu={(event) => {
                if (
                  !(event.target as HTMLElement).closest(
                    "[data-file-row],[data-dir-row]"
                  )
                ) {
                  setContextFile(null)
                  setContextDirectory(null)
                }
              }}
            >
              {rows.length === 0 ? (
                <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                  No files yet — import or drop diffs anywhere.
                </div>
              ) : treeRows.length === 0 ? (
                <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                  No files match your filter.
                </div>
              ) : (
                <div aria-label="Changed files" role="tree">
                  {treeRows.map(({ depth, node }) =>
                    node.kind === "directory" ? (
                      (() => {
                        const fileNames = collectFileTreeNames(node)
                        const hiddenCount = fileNames.filter((name) =>
                          hiddenFiles.has(name)
                        ).length
                        return (
                          <DirectoryTreeRow
                            key={node.path}
                            collapsed={collapsedDirs.has(node.path)}
                            depth={depth}
                            fullyHidden={
                              fileNames.length > 0 &&
                              hiddenCount === fileNames.length
                            }
                            partiallyHidden={
                              hiddenCount > 0 && hiddenCount < fileNames.length
                            }
                            laneIds={treeLaneIds}
                            node={node}
                            showLaneBadges={showTreeLaneBadges}
                            onContextDirectory={() => {
                              setContextFile(null)
                              setContextDirectory({
                                label: node.path,
                                names: fileNames,
                              })
                            }}
                            onToggle={() => toggleDirectory(node.path)}
                          />
                        )
                      })()
                    ) : (
                      <FileTreeRow
                        key={node.path}
                        depth={depth}
                        focusFile={focusFile}
                        activeFile={activeFile}
                        hidden={hiddenFiles.has(node.row?.name ?? "")}
                        laneIds={treeLaneIds}
                        node={node}
                        query={query}
                        showLaneBadges={showTreeLaneBadges}
                        onContextFile={(name) => {
                          setContextDirectory(null)
                          setContextFile(name)
                        }}
                        onFocus={onFocus}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          }
        />
        {contextFile || contextDirectory || hiddenFileRows.length > 0 ? (
          <ContextMenuContent className="w-72 p-1.5">
            {contextFile ? (
              <ContextMenuGroup>
                <ContextMenuLabel className="px-2 text-[10px] tracking-wide uppercase">
                  File
                </ContextMenuLabel>
                <div className="mx-1 mb-1 flex min-w-0 items-center gap-2 rounded-md bg-muted/45 px-2 py-1.5">
                  <FileTypeIcon path={contextFile} />
                  <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">
                    {contextFile}
                  </span>
                </div>
                {hiddenFiles.has(contextFile) ? (
                  <ContextMenuItem onClick={() => onShowFiles([contextFile])}>
                    <Eye className="size-4" />
                    Show file
                  </ContextMenuItem>
                ) : (
                  <ContextMenuItem onClick={() => onHideFiles([contextFile])}>
                    <EyeOff className="size-4" />
                    Hide file
                  </ContextMenuItem>
                )}
              </ContextMenuGroup>
            ) : null}

            {contextDirectory ? (
              <ContextMenuGroup>
                <ContextMenuLabel className="px-2 text-[10px] tracking-wide uppercase">
                  Folder
                </ContextMenuLabel>
                <div className="mx-1 mb-1 flex min-w-0 items-center gap-2 rounded-md bg-muted/45 px-2 py-1.5">
                  <Folder className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
                    {contextDirectory.label}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground/70 tabular-nums">
                    {contextDirectory.names.length}
                  </span>
                </div>
                {contextDirectory.names.every((name) =>
                  hiddenFiles.has(name)
                ) ? (
                  <ContextMenuItem
                    onClick={() => onShowFiles(contextDirectory.names)}
                  >
                    <Eye className="size-4" />
                    Show folder
                  </ContextMenuItem>
                ) : (
                  <ContextMenuItem
                    onClick={() => onHideFiles(contextDirectory.names)}
                  >
                    <EyeOff className="size-4" />
                    Hide folder
                  </ContextMenuItem>
                )}
                {contextDirectory.names.some((name) => hiddenFiles.has(name)) &&
                !contextDirectory.names.every((name) =>
                  hiddenFiles.has(name)
                ) ? (
                  <ContextMenuItem
                    onClick={() =>
                      onShowFiles(
                        contextDirectory.names.filter((name) =>
                          hiddenFiles.has(name)
                        )
                      )
                    }
                  >
                    <Eye className="size-4" />
                    Show hidden children
                  </ContextMenuItem>
                ) : null}
              </ContextMenuGroup>
            ) : null}

            {(contextFile || contextDirectory) && restorableRows.length > 0 ? (
              <ContextMenuSeparator />
            ) : null}

            {restorableRows.length > 0 ? (
              <ContextMenuGroup>
                <ContextMenuLabel className="px-2 text-[10px] tracking-wide uppercase">
                  Restore
                </ContextMenuLabel>
                {hiddenFileRows.length > 1 ? (
                  <ContextMenuItem onClick={onShowAllFiles}>
                    <RotateCcw className="size-4" />
                    Show all hidden files
                  </ContextMenuItem>
                ) : null}
                {restorableRows.slice(0, 6).map((row) => (
                  <ContextMenuItem
                    key={row.name}
                    onClick={() => onShowFiles([row.name])}
                    className="min-w-0"
                  >
                    <Eye className="size-4" />
                    <span className="truncate font-mono text-xs">
                      {row.name}
                    </span>
                  </ContextMenuItem>
                ))}
                {hiddenFileRows.length > 6 ? (
                  <ContextMenuItem onClick={onShowAllFiles}>
                    <RotateCcw className="size-4" />
                    Show all {hiddenFileRows.length} hidden files
                  </ContextMenuItem>
                ) : null}
              </ContextMenuGroup>
            ) : null}
          </ContextMenuContent>
        ) : null}
      </ContextMenu>
    </aside>
  )
}

function LaneBadges({ laneIds, row }: { laneIds: LaneId[]; row: FileRow }) {
  return (
    <span className="ml-1 flex shrink-0 justify-end gap-0.5">
      {laneIds.map((id) => {
        const style = laneStyle(id)
        return (
          <span
            key={id}
            className={cn(
              "grid size-3 place-items-center rounded-[3px] text-[8px] leading-none font-bold",
              row.panes[id]
                ? cn(style.soft, style.text)
                : "bg-muted text-muted-foreground/35"
            )}
          >
            {laneLabel(id)}
          </span>
        )
      })}
    </span>
  )
}

function DiffStats({ row }: { row: FileRow }) {
  return (
    <span className="flex w-16 shrink-0 items-center justify-end gap-1.5 text-right font-mono text-[10px] leading-none tabular-nums">
      <span className="text-add">+{row.additions}</span>
      <span className="text-del">−{row.deletions}</span>
    </span>
  )
}

function fileIconClass(token: string | undefined) {
  switch (token) {
    case "typescript":
      return "text-[#3178c6]"
    case "react":
      return "text-[#61dafb]"
    case "javascript":
      return "text-[#f7df1e]"
    case "json":
      return "text-[#f5c542]"
    case "css":
      return "text-[#2965f1]"
    case "html":
      return "text-[#e34f26]"
    case "markdown":
      return "text-[#7c8ea3]"
    case "python":
      return "text-[#4b8bbe]"
    case "rust":
      return "text-[#ce412b]"
    case "go":
      return "text-[#00add8]"
    case "yml":
      return "text-[#cb171e]"
    case "svg":
    case "image":
      return "text-[#f59e0b]"
    default:
      return "text-muted-foreground"
  }
}

function FileTypeIcon({ path }: { path: string }) {
  const icon = TREE_ICON_RESOLVER.resolveIcon("file-tree-icon-file", path)
  const id = icon.name.replace(/^#/, "")
  const width = icon.width ?? 16
  const height = icon.height ?? 16

  return (
    <svg
      aria-hidden
      className={cn("size-3.5 shrink-0", fileIconClass(icon.token))}
      viewBox={icon.viewBox ?? `0 0 ${width} ${height}`}
      width={width}
      height={height}
    >
      <use href={`#${id}`} />
    </svg>
  )
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const needle = query.trim().toLowerCase()
  if (!needle) return <>{text}</>
  const lower = text.toLowerCase()
  const out: React.ReactNode[] = []
  let cursor = 0
  let match = lower.indexOf(needle)
  while (match !== -1) {
    if (match > cursor) out.push(text.slice(cursor, match))
    out.push(
      <mark
        key={match}
        className="rounded-[2px] bg-amber-300/55 text-inherit dark:bg-amber-400/30"
      >
        {text.slice(match, match + needle.length)}
      </mark>
    )
    cursor = match + needle.length
    match = lower.indexOf(needle, cursor)
  }
  if (cursor < text.length) out.push(text.slice(cursor))
  return <>{out}</>
}

function DirectoryTreeRow({
  collapsed,
  depth,
  fullyHidden,
  laneIds,
  node,
  showLaneBadges,
  onContextDirectory,
  onToggle,
  partiallyHidden,
}: {
  collapsed: boolean
  depth: number
  fullyHidden: boolean
  laneIds: LaneId[]
  node: FileTreeNode
  showLaneBadges: boolean
  onContextDirectory: () => void
  onToggle: () => void
  partiallyHidden: boolean
}) {
  const summary = node.summary

  return (
    <button
      type="button"
      role="treeitem"
      data-dir-row=""
      aria-expanded={!collapsed}
      aria-selected="false"
      title={collapsed ? `Expand ${node.path}` : `Collapse ${node.path}`}
      onClick={onToggle}
      onContextMenu={onContextDirectory}
      className={cn(
        "group flex h-7 w-full items-center gap-1.5 rounded-md pr-1 text-left text-[12px] font-medium transition-colors",
        fullyHidden
          ? "text-muted-foreground/45 opacity-60 hover:bg-muted/35 hover:opacity-80"
          : "text-muted-foreground hover:bg-muted/55 hover:text-foreground"
      )}
      style={{ paddingLeft: 6 + depth * 12 }}
    >
      {collapsed ? (
        <Folder className="size-3.5 shrink-0" />
      ) : (
        <FolderOpen className="size-3.5 shrink-0" />
      )}
      <span className="min-w-0 flex-1 truncate">{node.name}</span>
      {fullyHidden || partiallyHidden ? (
        <EyeOff
          className={cn(
            "size-3 shrink-0",
            partiallyHidden && !fullyHidden && "opacity-55"
          )}
        />
      ) : null}
      {collapsed && summary ? (
        <>
          <DiffStats row={summary} />
          {showLaneBadges ? (
            <LaneBadges laneIds={laneIds} row={summary} />
          ) : null}
        </>
      ) : null}
    </button>
  )
}

function FileTreeRow({
  activeFile,
  depth,
  focusFile,
  hidden,
  laneIds,
  node,
  query,
  showLaneBadges,
  onContextFile,
  onFocus,
}: {
  activeFile: string | null
  depth: number
  focusFile: string | null
  hidden: boolean
  laneIds: LaneId[]
  node: FileTreeNode
  query: string
  showLaneBadges: boolean
  onContextFile: (name: string) => void
  onFocus: (name: string) => void
}) {
  const row = node.row
  if (!row) return null

  const isActive = activeFile === row.name
  const isFocused = focusFile === row.name

  return (
    <button
      type="button"
      role="treeitem"
      data-file-row=""
      aria-selected={isFocused}
      data-active={isActive ? "" : undefined}
      title={`${row.name}\nin ${row.presentIn
        .map(laneLabel)
        .join(", ")} · +${row.additions} −${row.deletions}`}
      onClick={() => onFocus(row.name)}
      onContextMenu={() => onContextFile(row.name)}
      className={cn(
        "group mb-0.5 flex h-7 w-full items-center gap-1.5 rounded-md border pr-1.5 text-left text-[12px] transition-colors",
        hidden
          ? "border-transparent text-muted-foreground/45 opacity-60 hover:bg-muted/35 hover:opacity-80"
          : isFocused
            ? "border-foreground/20 bg-foreground/10 text-foreground"
            : isActive
              ? "border-transparent bg-muted text-foreground"
              : "border-transparent text-foreground hover:bg-muted/60"
      )}
      style={{ paddingLeft: 6 + depth * 12 }}
    >
      <FileTypeIcon path={row.name} />
      <span className="min-w-0 flex-1 truncate">
        <HighlightMatch text={node.name} query={query} />
      </span>
      {hidden ? <EyeOff className="size-3 shrink-0" /> : null}
      <DiffStats row={row} />
      {showLaneBadges ? <LaneBadges laneIds={laneIds} row={row} /> : null}
    </button>
  )
}

/* ------------------------------------------------------------------ Lane */

function Lane({
  pane,
  view,
  layout,
  diffStyle,
  wrap,
  lineNumbers,
  showFilenames,
  codeTheme,
  refCallback,
  onScroll,
  onHide,
  onImport,
  onClear,
}: {
  pane: ParsedPane
  view: PaneView
  layout: Layout
  diffStyle: DiffStyle
  wrap: boolean
  lineNumbers: boolean
  showFilenames: boolean
  codeTheme: "light" | "dark"
  refCallback: (handle: CodeViewHandle<undefined> | null) => void
  onScroll: () => void
  onHide: () => void
  onImport: (files: FileList | null) => void
  onClear: () => void
}) {
  const style = laneStyle(pane.id)
  const isEmpty = !pane.text.trim()
  const importInputRef = useRef<HTMLInputElement>(null)
  const columnHeight = 44 + (isEmpty ? 148 : estimateCodeHeight(view))

  function handleColumnWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (layout !== "columns") return
    const scroller =
      event.currentTarget.querySelector<HTMLElement>(".overflow-auto")
    if (!scroller) return
    routeWheelToScroller(event, scroller)
  }

  return (
    <section
      data-lane={pane.id}
      className={cn(
        "flex min-h-0 flex-col rounded-xl border bg-card shadow-sm",
        style.border,
        isEmpty && "border-dashed bg-card/55",
        layout === "columns" && "max-h-full overflow-hidden",
        layout === "rows" && "h-auto overflow-visible"
      )}
      style={
        layout === "columns"
          ? ({
              height: `min(100%, ${columnHeight}px)`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <header className="relative flex min-h-11 shrink-0 items-center gap-2 overflow-hidden rounded-t-xl border-b border-border/70 bg-background/40 pr-1.5 pl-3">
        <span
          className={cn("absolute top-0 bottom-0 left-0 w-1", style.bar)}
          aria-hidden
        />
        <span
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-md text-[11px] leading-none font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28),inset_0_-1px_0_rgb(0_0_0/0.16)]",
            style.dot
          )}
        >
          {laneLabel(pane.id)}
        </span>
        <div className="flex min-w-0 flex-1 items-center whitespace-nowrap">
          <span className="min-w-0 truncate text-sm font-semibold">
            {pane.label}
          </span>
        </div>
        {!isEmpty && view.items.length > 0 ? (
          <span className="shrink-0 font-mono text-xs tabular-nums">
            <span className="text-add">+{view.additions}</span>{" "}
            <span className="text-del">−{view.deletions}</span>
          </span>
        ) : null}
        <input
          ref={importInputRef}
          type="file"
          accept=".diff,.patch,.txt"
          className="sr-only"
          onChange={(e) => {
            onImport(e.target.files)
            e.target.value = ""
          }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`${pane.label} actions`}
                title={`${pane.label} actions`}
                className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground/65 hover:bg-muted hover:text-foreground data-popup-open:bg-muted data-popup-open:text-foreground"
              >
                <MoreHorizontal className="size-4" />
              </button>
            }
          />
          <DropdownMenuContent align="end" sideOffset={6} className="w-40">
            <DropdownMenuItem onClick={() => importInputRef.current?.click()}>
              <Upload className="size-4" />
              Replace diff
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onHide}>
              <Eye className="size-4" />
              Hide panel
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isEmpty}
              variant="destructive"
              onClick={onClear}
            >
              <Trash2 className="size-4" />
              Clear diff
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div
        className={cn(
          "min-h-0",
          isEmpty
            ? "flex shrink-0 overflow-hidden"
            : layout === "rows"
              ? "block overflow-visible"
              : "flex flex-1 overflow-hidden"
        )}
        onWheelCapture={isEmpty ? undefined : handleColumnWheel}
      >
        {pane.error ? (
          <div className="p-4 text-sm text-destructive">{pane.error}</div>
        ) : isEmpty ? (
          <LaneDropzone style={style} onImport={onImport} />
        ) : layout === "rows" ? (
          <div className="min-w-0 bg-card">
            {view.files.map((fileDiff) => (
              <div key={fileDiff.name} data-row-file-name={fileDiff.name}>
                {showFilenames ? (
                  <RowFileHeader fileDiff={fileDiff} paneId={pane.id} />
                ) : null}
                <FileDiff
                  fileDiff={fileDiff}
                  options={{
                    diffStyle,
                    overflow: wrap ? "wrap" : "scroll",
                    disableLineNumbers: !lineNumbers,
                    disableFileHeader: false,
                    diffIndicators: "bars",
                    lineDiffType: "word-alt",
                    hunkSeparators: "line-info",
                    collapsedContextThreshold: 20,
                    expansionLineCount: 30,
                    theme: { light: "pierre-light", dark: "pierre-dark" },
                    themeType: codeTheme,
                    enableLineSelection: true,
                  }}
                  renderCustomHeader={() => null}
                  className="block bg-card"
                  style={
                    {
                      "--diffs-font-family": "var(--font-mono)",
                      "--diffs-font-size": "12.5px",
                      "--diffs-line-height": "20px",
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <CodeView
            ref={refCallback}
            items={view.items}
            onScroll={onScroll}
            options={{
              diffStyle,
              overflow: wrap ? "wrap" : "scroll",
              disableLineNumbers: !lineNumbers,
              disableFileHeader: false,
              diffIndicators: "bars",
              lineDiffType: "word-alt",
              hunkSeparators: "line-info",
              collapsedContextThreshold: 20,
              expansionLineCount: 30,
              theme: { light: "pierre-light", dark: "pierre-dark" },
              themeType: codeTheme,
              enableLineSelection: true,
              stickyHeaders: true,
              layout: {
                gap: 0,
                paddingBottom: 0,
                paddingTop: 0,
              },
            }}
            renderCustomHeader={
              showFilenames
                ? (item) => {
                    if (item.type !== "diff") return null
                    const additions = additionsFor(item.fileDiff)
                    const deletions = deletionsFor(item.fileDiff)
                    return (
                      <div className="group flex min-h-10 items-center gap-2 border-y border-border/70 bg-muted/45 px-3 text-foreground">
                        <FileTypeIcon path={item.fileDiff.name} />
                        <button
                          type="button"
                          title={`Copy ${item.fileDiff.name}`}
                          onClick={() => void copyFilePath(item.fileDiff.name)}
                          className="min-w-0 flex-1 cursor-pointer truncate text-left font-mono text-[11px] underline-offset-4 group-hover:underline group-hover:decoration-dashed"
                        >
                          {item.fileDiff.name}
                        </button>
                        <span className="shrink-0 font-mono text-[10px] tabular-nums">
                          <span className="text-add">+{additions}</span>{" "}
                          <span className="text-del">-{deletions}</span>
                        </span>
                      </div>
                    )
                  }
                : undefined
            }
            className={cn(
              "scroll-thin min-h-0 overflow-auto bg-card",
              "h-full w-full flex-1"
            )}
            style={
              {
                "--diffs-font-family": "var(--font-mono)",
                "--diffs-font-size": "12.5px",
                "--diffs-line-height": "20px",
              } as React.CSSProperties
            }
          />
        )}
      </div>
    </section>
  )
}

function RowFileHeader({
  fileDiff,
  paneId,
}: {
  fileDiff: FileDiffMetadata
  paneId: LaneId
}) {
  const additions = additionsFor(fileDiff)
  const deletions = deletionsFor(fileDiff)
  const style = laneStyle(paneId)

  return (
    <div className="group sticky top-0 z-20 flex min-h-10 items-center gap-2 border-y border-border/70 bg-muted/45 px-3 text-foreground backdrop-blur-sm">
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-md text-[11px] leading-none font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.28),inset_0_-1px_0_rgb(0_0_0/0.16)]",
          style.dot
        )}
      >
        {laneLabel(paneId)}
      </span>
      <FileTypeIcon path={fileDiff.name} />
      <button
        type="button"
        title={`Copy ${fileDiff.name}`}
        onClick={() => copyFilePath(fileDiff.name)}
        className="min-w-0 flex-1 cursor-pointer truncate text-left font-mono text-[11px] underline-offset-4 group-hover:underline group-hover:decoration-dashed"
      >
        {fileDiff.name}
      </button>
      <span className="shrink-0 font-mono text-[10px] tabular-nums">
        <span className="text-add">+{additions}</span>{" "}
        <span className="text-del">-{deletions}</span>
      </span>
    </div>
  )
}

function LaneDropzone({
  style,
  onImport,
}: {
  style: LaneStyle
  onImport: (files: FileList | null) => void
}) {
  return (
    <label
      className={cn(
        "grid flex-1 cursor-pointer place-items-center text-center transition-colors hover:bg-muted/30",
        style.text
      )}
    >
      <input
        type="file"
        accept=".diff,.patch,.txt"
        className="sr-only"
        onChange={(e) => {
          onImport(e.target.files)
          e.target.value = ""
        }}
      />
      <div className="px-6 pt-4 pb-0">
        <div
          className={cn(
            "mx-auto mb-3 grid size-10 place-items-center rounded-xl",
            style.soft,
            style.text
          )}
        >
          <Upload className="size-5" />
        </div>
        <div className="text-sm font-medium">Drop a diff here</div>
        <div className="mt-1 text-xs text-muted-foreground">
          or click to browse · .diff .patch .txt
        </div>
      </div>
    </label>
  )
}

/* --------------------------------------------------------------- Notepad */

function Notepad({
  open,
  value,
  onChange,
  onOpen,
  onClose,
}: {
  open: boolean
  value: string
  onChange: (v: string) => void
  onOpen: () => void
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      // clipboard blocked
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        title="Open notes (n)"
        className="fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full bg-note px-4 py-2.5 text-sm font-medium text-note-foreground shadow-lg ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
      >
        <StickyNote className="size-4" />
        Notes
        {value.trim() ? (
          <span className="size-2 rounded-full bg-note-foreground/70" />
        ) : null}
      </button>
    )
  }

  return (
    <div className="fixed right-6 bottom-6 z-40 flex w-[min(360px,calc(100vw-3rem))] -rotate-1 flex-col rounded-xl bg-note text-note-foreground shadow-2xl ring-1 ring-black/10">
      <div className="flex items-center gap-2 rounded-t-xl border-b border-note-foreground/15 px-3 py-2">
        <StickyNote className="size-4" />
        <span className="text-sm font-semibold">Observations</span>
        <span className="ml-auto font-mono text-[11px] text-note-foreground/60 tabular-nums">
          {value.length}
        </span>
        <button
          type="button"
          onClick={copy}
          title="Copy notes"
          className="grid size-7 place-items-center rounded-md hover:bg-note-foreground/10"
        >
          {copied ? (
            <Check className="size-4" />
          ) : (
            <Clipboard className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Hide notes (n)"
          className="grid size-7 place-items-center rounded-md hover:bg-note-foreground/10"
        >
          <Minus className="size-4" />
        </button>
      </div>
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="Loose notes, questions, tradeoffs…"
        className="bg-paper min-h-[260px] w-full resize-y rounded-b-xl bg-transparent px-4 py-2 font-mono text-[13px] leading-7 text-note-foreground outline-none placeholder:text-note-foreground/45"
      />
    </div>
  )
}

/* ----------------------------------------------------------- Drag overlay */

function DropOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/50 bg-card/80 px-10 py-8 shadow-xl">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Copy className="size-6" />
        </div>
        <div className="text-base font-semibold">Drop to import</div>
        <div className="text-sm text-muted-foreground">
          Up to 5 diffs → lanes A–E · drop on a lane to target it
        </div>
      </div>
    </div>
  )
}
