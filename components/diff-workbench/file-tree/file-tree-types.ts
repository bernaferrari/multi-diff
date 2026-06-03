import type { FileRow } from "../shared/types";

export type FileTreeNode = {
  children: Map<string, FileTreeNode>;
  fileNames?: string[];
  kind: "directory" | "file";
  name: string;
  path: string;
  row?: FileRow;
  summary?: FileRow;
};

export type VisibleFileTreeRow = {
  depth: number;
  node: FileTreeNode;
};
