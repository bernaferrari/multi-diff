import { toast } from "sonner"

export type ClipboardCopyResult = "blocked" | "copied" | "unavailable"

export async function copyTextToClipboard(
  text: string
): Promise<ClipboardCopyResult> {
  const clipboard = globalThis.navigator?.clipboard

  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text)
      return "copied"
    } catch {
      return copyTextWithSelectionFallback(text) ? "copied" : "blocked"
    }
  }

  return copyTextWithSelectionFallback(text) ? "copied" : "unavailable"
}

export async function copyTextWithToast({
  description,
  text,
  title,
}: {
  description?: string
  text: string
  title: string
}) {
  const result = await copyTextToClipboard(text)

  toast.success(title, { description })

  return result
}

export function getCopyLabel(target: string) {
  return `Copy ${target}`
}

export function getCopiedFilePathToast(path: string) {
  return {
    description: path,
    title: "Copied file path",
  }
}

function copyTextWithSelectionFallback(text: string) {
  const document = globalThis.document
  if (!document?.body || !document.execCommand) return false

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.top = "0"
  textarea.style.left = "-9999px"

  document.body.appendChild(textarea)
  textarea.select()

  try {
    return document.execCommand("copy")
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}
