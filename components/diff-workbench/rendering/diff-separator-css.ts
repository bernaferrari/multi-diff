export const compactSeparatorCSS = `
[data-separator="line-info"],
[data-separator="line-info-basic"],
[data-separator="metadata"],
[data-unified] [data-separator="line-info"],
[data-unified] [data-separator="line-info-basic"],
[data-separator="line-info"] [data-separator-wrapper],
[data-separator="line-info-basic"] [data-separator-wrapper],
[data-separator="metadata"] [data-separator-wrapper],
[data-separator="line-info"] [data-separator-content],
[data-separator="line-info-basic"] [data-separator-content] {
  height: 16px !important;
  min-height: 16px !important;
  box-sizing: border-box;
  border-radius: 0 !important;
}

[data-separator="line-info"],
[data-separator="line-info-basic"],
[data-separator="metadata"],
[data-unified] [data-separator="line-info"],
[data-unified] [data-separator="line-info-basic"] {
  margin-block: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
  overflow: hidden !important;
  padding: 0 !important;
}

[data-separator="line-info"] [data-separator-wrapper],
[data-separator="line-info-basic"] [data-separator-wrapper],
[data-separator="metadata"] [data-separator-wrapper],
[data-unified] [data-separator="line-info"] [data-separator-wrapper],
[data-unified] [data-separator="line-info-basic"] [data-separator-wrapper] {
  align-items: center !important;
  background: transparent;
  display: flex !important;
  inset: auto !important;
  padding-inline: 0 !important;
  position: relative !important;
  width: 100% !important;
  margin: 0 !important;
  overflow: hidden !important;
}

[data-separator="line-info"] [data-separator-content],
[data-separator="line-info-basic"] [data-separator-content],
:is([data-unified] [data-separator="line-info"] [data-separator-wrapper]) [data-separator-content],
:is([data-unified] [data-separator="line-info-basic"] [data-separator-wrapper]) [data-separator-content] {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  align-items: center !important;
  background: transparent !important;
  border-block: 1px solid color-mix(in oklch, var(--diffs-fg) 5%, transparent) !important;
  border-radius: 0 !important;
  color: color-mix(in oklch, var(--diffs-fg-number) 58%, transparent) !important;
  cursor: pointer;
  display: flex !important;
  justify-content: center !important;
  margin: 0 !important;
  min-height: 0 !important;
  padding-block: 0 !important;
  padding-inline: 0.75ch !important;
}

[data-separator="line-info"] [data-separator-content]:hover,
[data-separator="line-info-basic"] [data-separator-content]:hover,
:is([data-unified] [data-separator="line-info"] [data-separator-wrapper]) [data-separator-content]:hover,
:is([data-unified] [data-separator="line-info-basic"] [data-separator-wrapper]) [data-separator-content]:hover {
  text-decoration: none;
  background: color-mix(in oklch, var(--diffs-bg-context) 10%, transparent) !important;
}

[data-separator="line-info"] [data-unmodified-lines],
[data-separator="line-info-basic"] [data-unmodified-lines],
[data-separator="metadata"] [data-separator-wrapper] {
  font-size: 0.62em;
  letter-spacing: 0;
  line-height: 16px;
}

[data-separator="metadata"] [data-separator-wrapper] {
  background: transparent !important;
  border-block: 1px solid color-mix(in oklch, var(--diffs-fg) 5%, transparent) !important;
  color: color-mix(in oklch, var(--diffs-fg-number) 58%, transparent) !important;
  font-family: var(--diffs-font-family, var(--diffs-font-fallback)) !important;
  justify-content: center !important;
  padding: 0 0.75ch !important;
  text-transform: lowercase;
}

[data-separator="line-info"] [data-expand-button],
[data-separator="line-info-basic"] [data-expand-button],
:is([data-separator="line-info"] [data-separator-wrapper]) [data-expand-both],
:is([data-separator="line-info"] [data-separator-wrapper]) [data-expand-down],
:is([data-separator="line-info"] [data-separator-wrapper]) [data-expand-up] {
  align-items: center !important;
  background: color-mix(in oklch, var(--diffs-bg-context) 24%, var(--diffs-bg)) !important;
  border-right-color: color-mix(in oklch, var(--diffs-fg) 5%, transparent) !important;
  border-radius: 0 !important;
  display: flex !important;
  justify-content: center !important;
  margin: 0 !important;
  min-height: 0 !important;
  min-width: 40px;
  padding: 0 !important;
  width: 40px;
}

[data-unified] [data-separator="line-info"] [data-separator-wrapper],
[data-unified] [data-separator="line-info-basic"] [data-separator-wrapper] {
  width: 100% !important;
}

[data-separator="simple"] {
  background: color-mix(in oklch, var(--diffs-fg) 10%, transparent) !important;
  height: 2px !important;
  margin-block: 0 !important;
  min-height: 2px !important;
}

@supports (width: 1cqi) {
  [data-separator="line-info"] [data-separator-wrapper],
  [data-separator="line-info-basic"] [data-separator-wrapper],
  [data-separator="metadata"] [data-separator-wrapper],
  [data-separator="line-info"] [data-separator-content],
  [data-separator="line-info-basic"] [data-separator-content],
  :is([data-unified] [data-separator="line-info"] [data-separator-wrapper]) [data-separator-content],
  :is([data-unified] [data-separator="line-info-basic"] [data-separator-wrapper]) [data-separator-content] {
    background: transparent !important;
    border-radius: 0 !important;
    margin: 0 !important;
    padding-inline: 0 !important;
  }
}
`;
