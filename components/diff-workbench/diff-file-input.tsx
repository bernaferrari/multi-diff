import { forwardRef, type ChangeEvent } from "react"

export const DIFF_FILE_ACCEPT = ".diff,.patch,.txt"
export const DIFF_FILE_ACCEPT_LABEL = ".diff, .patch, or text"

type DiffFileInputProps = {
  multiple?: boolean
  onFiles: (files: FileList | null) => void | Promise<void>
}

export const DiffFileInput = forwardRef<HTMLInputElement, DiffFileInputProps>(
  function DiffFileInput({ multiple, onFiles }, ref) {
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      void onFiles(event.target.files)
      event.target.value = ""
    }

    return (
      <input
        ref={ref}
        type="file"
        accept={DIFF_FILE_ACCEPT}
        multiple={multiple}
        className="sr-only"
        onChange={handleChange}
      />
    )
  }
)
