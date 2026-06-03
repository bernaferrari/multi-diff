import { forwardRef, type ChangeEvent } from "react";

import type { ImportFileSource } from "./import-staging-state";

export const DIFF_FILE_ACCEPT = ".diff,.patch,.txt";
export const DIFF_FILE_ACCEPT_LABEL = ".diff, .patch, or text";

type DiffFileInputProps = {
  id?: string;
  multiple?: boolean;
  label?: string;
  onFiles: (files: ImportFileSource) => void | Promise<void>;
};

export const DiffFileInput = forwardRef<HTMLInputElement, DiffFileInputProps>(
  function DiffFileInput({ id, label = "Choose diff files", multiple, onFiles }, ref) {
    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      void onFiles(event.target.files);
      event.target.value = "";
    }

    return (
      <input
        ref={ref}
        id={id}
        type="file"
        accept={DIFF_FILE_ACCEPT}
        multiple={multiple}
        aria-label={label}
        className="sr-only"
        onChange={handleChange}
      />
    );
  },
);
