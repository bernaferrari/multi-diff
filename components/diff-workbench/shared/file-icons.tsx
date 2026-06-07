import { createFileTreeIconResolver, getBuiltInSpriteSheet } from "@pierre/trees";

import { cn } from "@/lib/utils";

const TREE_ICON_SPRITE = getBuiltInSpriteSheet("complete");

// Selected SVG paths from material-icon-theme (MIT, Copyright 2025 Material Extensions).
const LOCAL_ICON_SPRITE = `
  <symbol id="file-tree-local-language" viewBox="0 0 16 16">
    <path fill="currentColor" d="M8 1v3a3 3 0 0 0 3 3h3v5.5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 12.5v-9A2.5 2.5 0 0 1 4.5 1z" class="bg" opacity=".25"/>
    <path fill="currentColor" d="M9.5 1a.5.5 0 0 1 .354.146l4 4A.5.5 0 0 1 14 5.5V6h-3a2 2 0 0 1-2-2V1z" class="fg" opacity=".6"/>
  </symbol>
  <symbol id="file-tree-local-java" viewBox="0 0 32 32">
    <path fill="#f44336" d="M4 26h24v2H4zM28 4H7a1 1 0 0 0-1 1v13a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-4h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 8h-4V6h4Z"/>
  </symbol>
  <symbol id="file-tree-local-csharp" viewBox="0 0 32 32">
    <path fill="#0288d1" d="M30 14v-2h-2V8h-2v4h-2V8h-2v4h-2v2h2v2h-2v2h2v4h2v-4h2v4h2v-4h2v-2h-2v-2Zm-4 2h-2v-2h2Zm-12.437 6A5.57 5.57 0 0 1 8 16.437v-2.873A5.57 5.57 0 0 1 13.563 8H18V2h-4.437A11.563 11.563 0 0 0 2 13.563v2.873A11.564 11.564 0 0 0 13.563 28H18v-6Z"/>
  </symbol>
  <symbol id="file-tree-local-kotlin" viewBox="0 0 24 24">
    <linearGradient id="file-tree-local-kotlin-gradient" x1="1.725" x2="22.185" y1="22.67" y2="1.982" gradientTransform="translate(1.306 1.129)scale(.89324)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#7c4dff"/>
      <stop offset=".5" stop-color="#d500f9"/>
      <stop offset="1" stop-color="#ef5350"/>
    </linearGradient>
    <path fill="url(#file-tree-local-kotlin-gradient)" d="M2.975 2.976v18.048h18.05v-.03l-4.478-4.511-4.48-4.515 4.48-4.515 4.443-4.477z"/>
  </symbol>
  <symbol id="file-tree-local-php" viewBox="0 0 24 24">
    <path fill="#1e88e5" d="M12 18.08c-6.63 0-12-2.72-12-6.08s5.37-6.08 12-6.08S24 8.64 24 12s-5.37 6.08-12 6.08m-5.19-7.95c.54 0 .91.1 1.09.31.18.2.22.56.13 1.03-.1.53-.29.87-.58 1.09q-.42.33-1.29.33h-.87l.53-2.76zm-3.5 5.55h1.44l.34-1.75h1.23c.54 0 .98-.06 1.33-.17.35-.12.67-.31.96-.58.24-.22.43-.46.58-.73.15-.26.26-.56.31-.88.16-.78.05-1.39-.33-1.82-.39-.44-.99-.65-1.82-.65H4.59zm7.25-8.33-1.28 6.58h1.42l.74-3.77h1.14c.36 0 .6.06.71.18s.13.34.07.66l-.57 2.93h1.45l.59-3.07c.13-.62.03-1.07-.27-1.36-.3-.27-.85-.4-1.65-.4h-1.27L12 7.35zM18 10.13c.55 0 .91.1 1.09.31.18.2.22.56.13 1.03-.1.53-.29.87-.57 1.09-.29.22-.72.33-1.3.33h-.85l.5-2.76zm-3.5 5.55h1.44l.34-1.75h1.22c.55 0 1-.06 1.35-.17.35-.12.65-.31.95-.58.24-.22.44-.46.58-.73.15-.26.26-.56.32-.88.15-.78.04-1.39-.34-1.82-.36-.44-.99-.65-1.82-.65h-2.75z"/>
  </symbol>
  <symbol id="file-tree-local-dart" viewBox="0 0 32 32">
    <path fill="#4fc3f7" d="M16.83 2a1.3 1.3 0 0 0-.916.377l-.013.01L7.323 7.34l8.556 8.55v.005l10.283 10.277 1.96-3.529-7.068-16.96-3.299-3.297A1.3 1.3 0 0 0 16.828 2Z"/>
    <path fill="#01579b" d="m7.343 7.32-4.955 8.565-.01.013a1.297 1.297 0 0 0 .004 1.835l.005.005 4.106 4.107 16.064 6.314 3.632-2.015-.098-.098-.025.002L15.995 15.97h-.012z"/>
    <path fill="#01579b" d="m7.321 7.324 8.753 8.755h.013L26.16 26.156l3.835-.73L30 14.089l-4.049-3.965a6.5 6.5 0 0 0-3.618-1.612l.002-.043L7.323 7.325Z"/>
    <path fill="#64b5f6" d="m7.332 7.335 8.758 8.75v.013l10.079 10.071L25.436 30H14.09l-3.967-4.048a6.5 6.5 0 0 1-1.611-3.618l-.045.004Z"/>
  </symbol>
  <symbol id="file-tree-local-lua" viewBox="0 0 32 32">
    <path fill="#42a5f5" d="M30 6a3.86 3.86 0 0 1-1.167 2.833 4.024 4.024 0 0 1-5.666 0A3.86 3.86 0 0 1 22 6a3.86 3.86 0 0 1 1.167-2.833 4.024 4.024 0 0 1 5.666 0A3.86 3.86 0 0 1 30 6m-9.208 5.208A10.6 10.6 0 0 0 13 8a10.6 10.6 0 0 0-7.792 3.208A10.6 10.6 0 0 0 2 19a10.6 10.6 0 0 0 3.208 7.792A10.6 10.6 0 0 0 13 30a10.6 10.6 0 0 0 7.792-3.208A10.6 10.6 0 0 0 24 19a10.6 10.6 0 0 0-3.208-7.792m-1.959 7.625a4.024 4.024 0 0 1-5.666 0 4.024 4.024 0 0 1 0-5.666 4.024 4.024 0 0 1 5.666 0 4.024 4.024 0 0 1 0 5.666"/>
  </symbol>
  <symbol id="file-tree-local-scala" viewBox="0 0 32 32">
    <path fill="#f44336" d="m6.457 9.894 12.523 5.163-.456 1.211L6 11.105Zm7.02-3.091L26 11.966l-.457 1.21L13.02 8.015ZM6.465 18.885l12.524 5.163-.457 1.21L6.01 20.097Zm7.007-3.086 12.524 5.163-.456 1.21-12.524-5.162Z"/>
    <path fill="#f44336" d="M6 24.07V30l19.997-3.106V20.96zM6 5.11v5.99l20-3.11V2zm0 9.96v5.03l20-3.11v-5.03z"/>
  </symbol>
  <symbol id="file-tree-local-elixir" viewBox="0 0 24 24">
    <path fill="#9575cd" d="M12.173 22.681c-3.86 0-6.99-3.64-6.99-8.13 0-3.678 2.773-8.172 4.916-10.91 1.014-1.296 2.93-2.322 2.93-2.322s-.982 5.239 1.683 7.319c2.366 1.847 4.106 4.25 4.106 6.363 0 4.232-2.784 7.68-6.645 7.68"/>
  </symbol>
  <symbol id="file-tree-local-fsharp" viewBox="0 0 500 500">
    <path fill="#0288d1" d="m236.249 36.066-213.94 213.94 213.94 213.94v-84.36l-129.7-129.7 129.7-129.7z"/>
    <path fill="#0288d1" d="m236.249 156.017-93.622 93.62 93.622 93.622z"/>
    <path fill="#00b8d4" d="m263.759 36.047 213.94 213.94-213.94 213.94v-84.36l129.7-129.7-129.7-129.7z"/>
  </symbol>
  <symbol id="file-tree-local-haskell" viewBox="0 0 300 300">
    <path fill="#ef5350" d="m23.928 240.5 59.94-89.852-59.94-89.855h44.955l59.94 89.855-59.94 89.852z"/>
    <path fill="#ffa726" d="m83.869 240.5 59.94-89.852-59.94-89.855h44.955l119.88 179.71h-44.95l-37.46-56.156-37.468 56.156z"/>
    <path fill="#ffee58" d="m228.72 188.08-19.98-29.953h69.93v29.956h-49.95zm-29.97-44.924-19.98-29.953h99.901v29.953z"/>
  </symbol>
  <symbol id="file-tree-local-clojure" viewBox="0 0 256 256">
    <path fill="#64dd17" d="M123.456 129.975a507 507 0 0 0-3.54 7.846c-4.406 9.981-9.284 22.127-11.066 29.908-.64 2.77-1.037 6.205-1.03 10.013 0 1.506.081 3.09.21 4.702a58.1 58.1 0 0 0 19.98 3.559 58.2 58.2 0 0 0 18.29-2.98c-1.352-1.237-2.642-2.554-3.816-4.038-7.796-9.942-12.146-24.512-19.028-49.01m-28.784-49.39C79.782 91.08 70.039 108.387 70.002 128c.037 19.32 9.487 36.403 24.002 46.94 3.56-14.83 12.485-28.41 25.868-55.63a219 219 0 0 0-2.714-7.083c-3.708-9.3-9.059-20.102-13.834-24.993-2.435-2.555-5.389-4.763-8.652-6.648"/>
    <path fill="#7cb342" d="M178.532 194.535c-7.683-.963-14.023-2.124-19.57-4.081a69.4 69.4 0 0 1-30.958 7.249c-38.491 0-69.693-31.198-69.698-69.7 0-20.891 9.203-39.62 23.764-52.392-3.895-.94-7.956-1.49-12.104-1.482-20.45.193-42.037 11.51-51.025 42.075-.84 4.45-.64 7.813-.64 11.8 0 60.591 49.12 109.715 109.705 109.715 37.104 0 69.882-18.437 89.732-46.633-10.736 2.675-21.06 3.955-29.902 3.982-3.314 0-6.425-.177-9.305-.53"/>
    <path fill="#29b6f6" d="M157.922 173.271c.678.336 2.213.884 4.35 1.49 14.375-10.553 23.717-27.552 23.754-46.764h-.005c-.055-32.03-25.974-57.945-58.011-58.009a58.2 58.2 0 0 0-18.213 2.961c11.779 13.426 17.443 32.613 22.922 53.6l.01.025c.01.017 1.752 5.828 4.743 13.538 2.97 7.7 7.203 17.231 11.818 24.178 3.03 4.655 6.363 8 8.632 8.981"/>
    <path fill="#1e88e5" d="M128.009 18.29c-36.746 0-69.25 18.089-89.16 45.826 10.361-6.49 20.941-8.83 30.174-8.747 12.753.037 22.779 3.991 27.589 6.696a51 51 0 0 1 3.345 2.131 69.4 69.4 0 0 1 28.049-5.894c38.496.004 69.703 31.202 69.709 69.698h-.006c0 19.409-7.938 36.957-20.736 49.594 3.142.352 6.492.571 9.912.554 12.15.006 25.284-2.675 35.13-10.956 6.42-5.408 11.798-13.327 14.78-25.199.584-4.586.92-9.247.92-13.991 0-60.588-49.116-109.715-109.705-109.715"/>
  </symbol>
  <symbol id="file-tree-local-perl" viewBox="0 0 24 24">
    <path fill="#ba68c8" d="M11.057 2.981c.537.735.028 1.653.141 2.472a3.42 3.42 0 0 1-1.03 2.415c-1.414 1.625-3.165 3.038-4.097 5.03a5.28 5.28 0 0 0 1.412 5.847c.706.735 1.54 1.342 2.472 1.738.17.805-1.088.184-1.455 0A6.7 6.7 0 0 1 4.361 16.4a5.44 5.44 0 0 1 .904-5.368c1.272-1.61 3.136-2.543 4.662-3.857.565-.55 1.003-1.3.932-2.119.156-.678-.254-1.469.212-2.09zm-.07 18.929c-.17.198-.467.325-.495.24-.042-.085.212-.127.381-.325.17-.183.127-.522.24-.522.1 0 .043.395-.14.607zm2.16 0c.17.198.453.31.495.24.028-.085-.212-.141-.395-.339-.156-.184-.113-.523-.24-.523-.085 0-.029.41.14.608zm-1.03.48c-.1 0-.071-.296-.071-.65 0-.367-.028-.663.07-.663.085 0 .057.296.057.663 0 .354.014.65-.057.65m-.495-20.765c.34.24.254 2.077.254 3.136 0 1.653.184 3.376-.805 4.916-.96 1.497-2.048 3.108-1.95 4.972.1 1.837.99 3.504 2.148 5.043.664.876-.353.509-.876.085a7.2 7.2 0 0 1-2.755-5.664c.142-1.907 1.597-3.348 2.628-4.803.805-1.13 1.186-1.879 1.215-3.645.028-1.412-.142-3.531.042-3.983.014-.043.07-.1.099-.057m.537 2.232c-.085 0-.043.396.028.72.424 2.26-.198 4.52-.749 6.682a12.77 12.77 0 0 0 .283 7.826c.607 1.568 1.71.791 2.161 1.568.34.593 1.272.198 1.978-.141 2.232-1.102 4.012-3.108 4.11-5.566.029-.494 0-.989-.07-1.497-.283-1.837-1.78-3.065-3.15-4.083-1.215-.89-2.74-1.483-3.659-2.613-.523-.65-.297-1.638-.381-2.458-.043-.452-.255-.042-.382-.268-.084-.127-.14-.17-.17-.17zm.72 3.616c.057 0 .17.071.325.226a20 20 0 0 0 2.161 1.921c1.272.961 2.43 2.091 2.967 3.504.339.875.339 1.836.226 2.74-.184 1.384-1.187 2.444-2.119 3.404-.339.354-1.06.791-1.074.678-.084-.367.763-1.172 1.159-1.695A5.93 5.93 0 0 0 16 10.962c-1.102-1.214-2.317-1.907-2.995-3.08-.14-.253-.183-.409-.113-.409z"/>
  </symbol>
  <symbol id="file-tree-local-makefile" viewBox="0 0 32 32">
    <path fill="#ef5350" d="m29.5 24.02-1.6-.92a4.4 4.4 0 0 0 .09-.9A1.3 1.3 0 0 0 28 22a5.6 5.6 0 0 0-.1-1.1l1.6-.92a.493.493 0 0 0 .18-.68l-1.5-2.6a.45.45 0 0 0-.18-.18V6.01a2.006 2.006 0 0 0-2-2H4a2.006 2.006 0 0 0-2 2V22a2.006 2.006 0 0 0 2 2h10.53l-.03.02a.493.493 0 0 0-.18.68l1.5 2.6a.493.493 0 0 0 .68.18l1.6-.92a5.9 5.9 0 0 0 1.9 1.09v1.85a.495.495 0 0 0 .5.5h3a.495.495 0 0 0 .5-.5v-1.85a5.9 5.9 0 0 0 1.9-1.09l1.6.92a.493.493 0 0 0 .68-.18l1.5-2.6a.493.493 0 0 0-.18-.68M24 22.01a1.99 1.99 0 0 1-.88 1.65l-.18.11a2.04 2.04 0 0 1-1.88 0l-.18-.11a1.99 1.99 0 0 1-.88-1.65V22a2 2 0 0 1 .88-1.66l.18-.11a2.04 2.04 0 0 1 1.88 0l.18.11A2 2 0 0 1 24 22Zm2-4.63-.1.06a5.9 5.9 0 0 0-1.9-1.09V14.5a.495.495 0 0 0-.5-.5h-3a.495.495 0 0 0-.5.5v1.85a5.9 5.9 0 0 0-1.9 1.09l-1.6-.92a.493.493 0 0 0-.68.18l-1.5 2.6a.493.493 0 0 0 .18.68l1.6.92A5.6 5.6 0 0 0 16 22v.01L4 22V10.01h22Z"/>
  </symbol>
`;

const TREE_ICON_SPRITE_WITH_FALLBACKS = TREE_ICON_SPRITE.replace(
  "</svg>",
  `${LOCAL_ICON_SPRITE}\n</svg>`,
);

const TREE_ICON_RESOLVER = createFileTreeIconResolver({
  set: "complete",
  colored: true,
});

type FileIconView = {
  className: string;
  height: number;
  id: string;
  viewBox: string;
  width: number;
};

type LocalLanguageIcon = {
  id: string;
  token: string;
  viewBox?: string;
};

const LOCAL_LANGUAGE_ICON_BY_EXTENSION: Record<string, LocalLanguageIcon> = {
  clj: { id: "file-tree-local-clojure", token: "clojure", viewBox: "0 0 256 256" },
  cljs: { id: "file-tree-local-clojure", token: "clojure", viewBox: "0 0 256 256" },
  cs: { id: "file-tree-local-csharp", token: "csharp", viewBox: "0 0 32 32" },
  dart: { id: "file-tree-local-dart", token: "dart", viewBox: "0 0 32 32" },
  ex: { id: "file-tree-local-elixir", token: "elixir", viewBox: "0 0 24 24" },
  exs: { id: "file-tree-local-elixir", token: "elixir", viewBox: "0 0 24 24" },
  fs: { id: "file-tree-local-fsharp", token: "fsharp", viewBox: "0 0 500 500" },
  fsx: { id: "file-tree-local-fsharp", token: "fsharp", viewBox: "0 0 500 500" },
  hs: { id: "file-tree-local-haskell", token: "haskell", viewBox: "0 0 300 300" },
  java: { id: "file-tree-local-java", token: "java", viewBox: "0 0 32 32" },
  kt: { id: "file-tree-local-kotlin", token: "kotlin", viewBox: "0 0 24 24" },
  kts: { id: "file-tree-local-kotlin", token: "kotlin", viewBox: "0 0 24 24" },
  lua: { id: "file-tree-local-lua", token: "lua", viewBox: "0 0 32 32" },
  m: { id: "file-tree-local-language", token: "objective-c" },
  php: { id: "file-tree-local-php", token: "php", viewBox: "0 0 24 24" },
  pl: { id: "file-tree-local-perl", token: "perl", viewBox: "0 0 24 24" },
  pm: { id: "file-tree-local-perl", token: "perl", viewBox: "0 0 24 24" },
  r: { id: "file-tree-local-language", token: "r" },
  scala: { id: "file-tree-local-scala", token: "scala", viewBox: "0 0 32 32" },
};

const LOCAL_LANGUAGE_ICON_BY_NAME: Record<string, LocalLanguageIcon> = {
  makefile: { id: "file-tree-local-makefile", token: "makefile", viewBox: "0 0 32 32" },
};

function fileIconClass(token: string | undefined) {
  switch (token) {
    case "java":
      return "text-[#e76f00]";
    case "kotlin":
      return "text-[#7f52ff]";
    case "csharp":
      return "text-[#68217a]";
    case "php":
      return "text-[#777bb4]";
    case "dart":
      return "text-[#0175c2]";
    case "lua":
      return "text-[#000080]";
    case "scala":
      return "text-[#dc322f]";
    case "elixir":
      return "text-[#6e4a7e]";
    case "fsharp":
      return "text-[#378bba]";
    case "r":
      return "text-[#276dc3]";
    case "perl":
      return "text-[#39457e]";
    case "haskell":
      return "text-[#5e5086]";
    case "clojure":
      return "text-[#5881d8]";
    case "makefile":
      return "text-[#427819]";
    case "typescript":
      return "text-[#3178c6]";
    case "react":
      return "text-[#61dafb]";
    case "javascript":
      return "text-[#f7df1e]";
    case "json":
      return "text-[#f5c542]";
    case "css":
      return "text-[#2965f1]";
    case "html":
      return "text-[#e34f26]";
    case "markdown":
      return "text-[#7c8ea3]";
    case "python":
      return "text-[#4b8bbe]";
    case "rust":
      return "text-[#ce412b]";
    case "go":
      return "text-[#00add8]";
    case "yml":
      return "text-[#cb171e]";
    case "svg":
    case "image":
      return "text-[#f59e0b]";
    default:
      return "text-muted-foreground";
  }
}

function getLocalLanguageIcon(path: string): FileIconView | undefined {
  const fileName = path.split(/[\\/]/).pop()?.toLowerCase() ?? path.toLowerCase();
  const nameMatch = LOCAL_LANGUAGE_ICON_BY_NAME[fileName];
  const extension = fileName.includes(".") ? fileName.split(".").pop() : undefined;
  const extensionMatch = extension ? LOCAL_LANGUAGE_ICON_BY_EXTENSION[extension] : undefined;
  const icon = nameMatch ?? extensionMatch;

  if (icon == null) {
    return undefined;
  }

  return {
    className: fileIconClass(icon.token),
    height: 16,
    id: icon.id,
    viewBox: icon.viewBox ?? "0 0 16 16",
    width: 16,
  };
}

function getFileIconView(path: string): FileIconView {
  const localIcon = getLocalLanguageIcon(path);
  if (localIcon != null) {
    return localIcon;
  }

  const icon = TREE_ICON_RESOLVER.resolveIcon("file-tree-icon-file", path);
  const id = icon.name.replace(/^#/, "");
  const width = icon.width ?? 16;
  const height = icon.height ?? 16;

  return {
    className: fileIconClass(icon.token),
    height,
    id,
    viewBox: icon.viewBox ?? `0 0 ${width} ${height}`,
    width,
  };
}

export function FileTypeIcon({ path }: { path: string }) {
  const icon = getFileIconView(path);

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
  );
}

export function TreeIconSprite() {
  return (
    <span
      aria-hidden
      className="hidden"
      dangerouslySetInnerHTML={{ __html: TREE_ICON_SPRITE_WITH_FALLBACKS }}
    />
  );
}
