import { type ButtonHTMLAttributes, type ReactNode } from "react"

type TreeRowButtonProps = {
  children: ReactNode
  depth: number
  selected?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

export function TreeRowButton({
  children,
  className,
  depth,
  selected = false,
  style,
  ...props
}: TreeRowButtonProps) {
  return (
    <button
      {...props}
      type="button"
      role="treeitem"
      aria-selected={selected}
      className={className}
      style={{ ...getTreeRowIndent(depth), ...style }}
    >
      {children}
    </button>
  )
}

function getTreeRowIndent(depth: number) {
  return { paddingLeft: 6 + depth * 12 }
}
