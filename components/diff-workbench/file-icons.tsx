import {
  createFileTreeIconResolver,
  getBuiltInSpriteSheet,
} from "@pierre/trees"

import { cn } from "@/lib/utils"

const TREE_ICON_SPRITE = getBuiltInSpriteSheet("complete")

const TREE_ICON_RESOLVER = createFileTreeIconResolver({
  set: "complete",
  colored: true,
})

type FileIconView = {
  className: string
  height: number
  id: string
  viewBox: string
  width: number
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

function getFileIconView(path: string): FileIconView {
  const icon = TREE_ICON_RESOLVER.resolveIcon("file-tree-icon-file", path)
  const id = icon.name.replace(/^#/, "")
  const width = icon.width ?? 16
  const height = icon.height ?? 16

  return {
    className: fileIconClass(icon.token),
    height,
    id,
    viewBox: icon.viewBox ?? `0 0 ${width} ${height}`,
    width,
  }
}

export function FileTypeIcon({ path }: { path: string }) {
  const icon = getFileIconView(path)

  return (
    <svg
      aria-hidden
      className={cn("size-3.5 shrink-0", icon.className)}
      viewBox={icon.viewBox}
      width={icon.width}
      height={icon.height}
    >
      <use href={`#${icon.id}`} />
    </svg>
  )
}

export function TreeIconSprite() {
  return (
    <span
      aria-hidden
      className="hidden"
      dangerouslySetInnerHTML={{ __html: TREE_ICON_SPRITE }}
    />
  )
}
