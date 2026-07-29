#!/usr/bin/env node

// src/cli.tsx
import { createRequire } from "module";
import { render } from "ink";

// src/app.tsx
import { useCallback, useEffect as useEffect4, useRef as useRef3, useState as useState4 } from "react";
import os4 from "os";
import path4 from "path";
import { Box as Box5, Text as Text7, useApp, useInput as useInput2, useStdout as useStdout3 } from "ink";
import SelectInput from "ink-select-input";
import Spinner from "ink-spinner";

// src/components/framed-input.tsx
import { Box, Text } from "ink";

// src/theme.ts
import React, { createContext, useContext } from "react";
var THEME_MODES = ["auto", "light", "dark"];
var themes = {
  auto: {
    mode: "auto",
    // Leaving colors unset is more reliable than trying to detect whether a
    // terminal is light or dark. ANSI defaults already follow its theme.
    primary: void 0,
    gray: void 0,
    dark: void 0,
    background: void 0,
    dimSecondary: true,
    inverseButton: true
  },
  light: {
    mode: "light",
    primary: "#18181b",
    gray: "#52525b",
    dark: "#ffffff",
    background: "#ffffff",
    dimSecondary: false,
    inverseButton: false
  },
  dark: {
    mode: "dark",
    primary: "#ffffff",
    gray: "#a1a1aa",
    dark: "#18181b",
    background: "#18181b",
    dimSecondary: false,
    inverseButton: false
  }
};
var ThemeContext = createContext(themes.auto);
function themeFor(mode) {
  return themes[mode];
}
function ThemeProvider({ mode, children }) {
  return React.createElement(ThemeContext.Provider, { value: themeFor(mode) }, children);
}
function useTheme() {
  return useContext(ThemeContext);
}
function isThemeMode(value) {
  return typeof value === "string" && THEME_MODES.includes(value);
}
function nextThemeMode(mode) {
  return THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length];
}

// src/components/framed-input.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var frameButtonWidth = (label) => label.length + 4;
function FramedInput({
  title,
  width,
  button,
  buttonDim = false,
  children
}) {
  const theme = useTheme();
  const inner = width - 2;
  const tail = Math.max(0, inner - title.length - 3);
  const buttonW = button ? frameButtonWidth(button) : 0;
  const fillColor = buttonDim ? theme.gray : theme.primary;
  return /* @__PURE__ */ jsxs(Box, { width: width + buttonW, children: [
    /* @__PURE__ */ jsxs(Box, { flexDirection: "column", width, children: [
      /* @__PURE__ */ jsxs(Text, { children: [
        /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: "\u256D\u2500 " }),
        /* @__PURE__ */ jsx(Text, { color: theme.primary, children: title }),
        /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: ` ${"\u2500".repeat(tail)}${button ? "\u2500" : "\u256E"}` })
      ] }),
      /* @__PURE__ */ jsxs(Box, { width, height: 1, overflow: "hidden", children: [
        /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: "\u2502 " }),
        /* @__PURE__ */ jsx(Text, { color: theme.primary, children: "\u276F " }),
        /* @__PURE__ */ jsx(Box, { flexGrow: 1, height: 1, overflow: "hidden", children }),
        button ? null : /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: " \u2502" })
      ] }),
      /* @__PURE__ */ jsx(Text, { color: theme.gray, dimColor: theme.dimSecondary, children: `\u2570${"\u2500".repeat(inner)}${button ? "\u2500" : "\u256F"}` })
    ] }),
    button ? /* @__PURE__ */ jsxs(Box, { flexDirection: "column", width: buttonW, children: [
      /* @__PURE__ */ jsx(Text, { bold: true, color: fillColor, dimColor: buttonDim && theme.dimSecondary, children: "\u2584".repeat(buttonW) }),
      /* @__PURE__ */ jsx(
        Text,
        {
          backgroundColor: theme.inverseButton ? void 0 : fillColor,
          color: theme.inverseButton ? void 0 : theme.dark,
          inverse: theme.inverseButton && !buttonDim,
          dimColor: buttonDim && theme.dimSecondary,
          bold: true,
          children: `  ${button}  `
        }
      ),
      /* @__PURE__ */ jsx(Text, { bold: true, color: fillColor, dimColor: buttonDim && theme.dimSecondary, children: "\u2580".repeat(buttonW) })
    ] }) : null
  ] });
}

// src/components/fullscreen.tsx
import { useEffect, useState } from "react";
import { Box as Box2, useStdout } from "ink";
import { jsx as jsx2 } from "react/jsx-runtime";
function FullScreen({ children }) {
  const theme = useTheme();
  const { stdout } = useStdout();
  const dimensions = () => ({
    columns: stdout?.columns && stdout.columns > 0 ? stdout.columns : 80,
    rows: stdout?.rows && stdout.rows > 1 ? stdout.rows : 24
  });
  const [size, setSize] = useState(dimensions);
  useEffect(() => {
    if (!stdout) return;
    const onResize = () => setSize(dimensions());
    stdout.on("resize", onResize);
    return () => {
      stdout.off("resize", onResize);
    };
  }, [stdout]);
  return /* @__PURE__ */ jsx2(
    Box2,
    {
      width: size.columns,
      height: size.rows - 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      children: /* @__PURE__ */ jsx2(Box2, { flexDirection: "column", alignItems: "center", flexShrink: 0, children })
    }
  );
}

// src/components/logo.tsx
import { useEffect as useEffect2, useMemo, useState as useState2 } from "react";
import { Box as Box3, Text as Text2 } from "ink";
import { jsx as jsx3 } from "react/jsx-runtime";
var ART = [
  "\u2593 \u2593 \u2588\u2580\u2588 \u2580\u2588\u2580 \u2588\u2580\u2584\u2588 \u2588 \u2588 \u2588\u2580\u2580",
  "\u2580\u2588\u2580 \u2588 \u2593  \u2593  \u2588  \u2593 \u2593\u2580\u2584 \u2580\u2580\u2593",
  " \u2580  \u2580\u2580\u2580 \u2580\u2580\u2580 \u2580  \u2580 \u2580 \u2580 \u2580\u2580\u2580"
];
var GRID = ART.map((line) => [...line]);
var ROWS = GRID.length;
var INTRO_MS = 900;
var INTRO_SPREAD_MS = 550;
var SWEEP_MS = 1e3;
var SWEEP_EVERY_MS = 7e3;
var TILT = 2;
var HALF = 2.4;
var LIGHTER = { "\u2588": "\u2592", "\u2593": "\u2591" };
var HALF_BLOCKS = /* @__PURE__ */ new Set(["\u2580", "\u2584"]);
var ease = (t) => 1 - Math.pow(1 - t, 3);
function cellAt(ch, row, col, phase, t, delay, theme) {
  if (ch === " " || phase === "idle") return { ch, color: theme.primary, dim: false };
  if (phase === "intro") {
    const dt = t - delay;
    if (dt < 0) return { ch: " ", color: theme.primary, dim: false };
    if (dt < 110) return { ch: HALF_BLOCKS.has(ch) ? ch : "\u2591", color: theme.gray, dim: theme.dimSecondary };
    if (dt < 220) return { ch: HALF_BLOCKS.has(ch) ? ch : "\u2592", color: theme.gray, dim: theme.dimSecondary };
    return { ch, color: theme.primary, dim: false };
  }
  const cols = GRID[0].length;
  const pMin = -TILT * ROWS - HALF;
  const pMax = cols + HALF;
  const p = pMin + ease(t / SWEEP_MS) * (pMax - pMin);
  const d = Math.abs(col - (ROWS - 1 - row) * TILT - p);
  if (d <= HALF && 1 - d / HALF > 0.35) {
    if (HALF_BLOCKS.has(ch)) return { ch, color: theme.gray, dim: theme.dimSecondary };
    return { ch: LIGHTER[ch] ?? ch, color: theme.primary, dim: false };
  }
  return { ch, color: theme.primary, dim: false };
}
function renderRow(row, phase, t, delays, theme) {
  const segments = [];
  GRID[row].forEach((ch, col) => {
    const cell = cellAt(ch, row, col, phase, t, delays[col], theme);
    const last = segments[segments.length - 1];
    if (last && (last.color === cell.color && last.dim === cell.dim || cell.ch === " ")) last.text += cell.ch;
    else segments.push({ text: cell.ch, color: cell.color, dim: cell.dim });
  });
  return segments.map((seg, i) => /* @__PURE__ */ jsx3(Text2, { color: seg.color, dimColor: seg.dim, children: seg.text }, i));
}
function Logo() {
  const theme = useTheme();
  const animated = Boolean(process.stdout.isTTY);
  const delays = useMemo(
    () => GRID.map((row) => row.map(() => Math.random() * INTRO_SPREAD_MS)),
    []
  );
  const [phase, setPhase] = useState2(animated ? "intro" : "idle");
  const [t, setT] = useState2(0);
  useEffect2(() => {
    if (!animated) return;
    if (phase === "idle") {
      const id2 = setTimeout(() => {
        setT(0);
        setPhase("sweep");
      }, SWEEP_EVERY_MS);
      return () => clearTimeout(id2);
    }
    const duration = phase === "intro" ? INTRO_MS : SWEEP_MS;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        setT(0);
        setPhase("idle");
      } else {
        setT(elapsed);
      }
    }, 33);
    return () => clearInterval(id);
  }, [phase, animated]);
  return (
    // flexShrink=0 — the logo must keep its 3 rows even when a phase's
    // content would overflow the screen, or yoga crushes it first
    /* @__PURE__ */ jsx3(Box3, { flexDirection: "column", flexShrink: 0, children: GRID.map((_, row) => /* @__PURE__ */ jsx3(Text2, { children: renderRow(row, phase, t, delays[row], theme) }, row)) })
  );
}

// src/components/panel.tsx
import { Box as Box4, Text as Text3 } from "ink";
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function Panel({ title, width, children }) {
  const theme = useTheme();
  const inner = width - 2;
  const tail = Math.max(0, inner - title.length - 3);
  return /* @__PURE__ */ jsxs2(Box4, { flexDirection: "column", width, children: [
    /* @__PURE__ */ jsxs2(Text3, { children: [
      /* @__PURE__ */ jsx4(Text3, { color: theme.gray, dimColor: theme.dimSecondary, children: "\u256D\u2500 " }),
      /* @__PURE__ */ jsx4(Text3, { color: theme.primary, children: title }),
      /* @__PURE__ */ jsx4(Text3, { color: theme.gray, dimColor: theme.dimSecondary, children: ` ${"\u2500".repeat(tail)}\u256E` })
    ] }),
    /* @__PURE__ */ jsx4(
      Box4,
      {
        width,
        borderStyle: "round",
        borderColor: theme.gray,
        borderDimColor: theme.dimSecondary,
        borderBackgroundColor: theme.background,
        borderTop: false,
        flexDirection: "column",
        paddingX: 2,
        children
      }
    )
  ] });
}

// src/components/progress-bar.tsx
import { Text as Text4 } from "ink";
import { jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
function ProgressBar({ percent, width = 30 }) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, percent));
  const filled = Math.round(clamped * width);
  return /* @__PURE__ */ jsxs3(Text4, { children: [
    /* @__PURE__ */ jsx5(Text4, { color: theme.primary, children: "\u2588".repeat(filled) }),
    /* @__PURE__ */ jsx5(Text4, { color: theme.gray, dimColor: theme.dimSecondary, children: "\u2591".repeat(width - filled) }),
    /* @__PURE__ */ jsxs3(Text4, { color: theme.primary, children: [
      " ",
      `${Math.round(clamped * 100)}%`.padStart(4)
    ] })
  ] });
}

// src/components/shortcuts.tsx
import { Text as Text5 } from "ink";
import { Fragment, jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
function Shortcuts({ items, leading }) {
  const theme = useTheme();
  return /* @__PURE__ */ jsxs4(Text5, { children: [
    leading ? /* @__PURE__ */ jsxs4(Fragment, { children: [
      leading,
      /* @__PURE__ */ jsx6(Text5, { color: theme.gray, dimColor: theme.dimSecondary, children: "  \xB7  " })
    ] }) : null,
    items.map(([key, label], index) => /* @__PURE__ */ jsxs4(Text5, { children: [
      index > 0 ? /* @__PURE__ */ jsx6(Text5, { color: theme.gray, dimColor: theme.dimSecondary, children: "  \xB7  " }) : null,
      /* @__PURE__ */ jsx6(Text5, { color: theme.primary, children: key }),
      /* @__PURE__ */ jsxs4(Text5, { color: theme.gray, dimColor: theme.dimSecondary, children: [
        " ",
        label
      ] })
    ] }, `${key}-${label}`))
  ] });
}

// src/components/text-input.tsx
import { useRef as useRef2, useState as useState3 } from "react";
import { Text as Text6, useInput } from "ink";

// src/lib/use-mouse-click.ts
import { useEffect as useEffect3, useRef } from "react";
import { useStdin, useStdout as useStdout2 } from "ink";
var ENABLE = "\x1B[?1000h\x1B[?1006h";
var DISABLE = "\x1B[?1006l\x1B[?1000l";
var SGR_PRESS = /\u001B\[<(\d+);(\d+);(\d+)M/g;
function useMouseClick(onClick, isActive) {
  const handlerRef = useRef(onClick);
  handlerRef.current = onClick;
  const { stdin } = useStdin();
  const { stdout } = useStdout2();
  useEffect3(() => {
    if (!isActive || !stdin || !stdout || !process.stdin.isTTY) return;
    stdout.write(ENABLE);
    const onData = (data) => {
      for (const match of String(data).matchAll(SGR_PRESS)) {
        const [, button, x, y] = match;
        if (button === "0") handlerRef.current(Number(x), Number(y));
      }
    };
    stdin.on("data", onData);
    return () => {
      stdin.off("data", onData);
      stdout.write(DISABLE);
    };
  }, [isActive, stdin, stdout]);
}
var stripMouseReports = (value) => value.replace(/\u001B?\[?<\d+;\d+;\d+[Mm]/g, "");

// src/components/text-input.tsx
import { jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
var wordLeft = (text, from) => {
  let i = from;
  while (i > 0 && !/\w/.test(text[i - 1])) i--;
  while (i > 0 && /\w/.test(text[i - 1])) i--;
  return i;
};
var wordRight = (text, from) => {
  let i = from;
  while (i < text.length && !/\w/.test(text[i])) i++;
  while (i < text.length && /\w/.test(text[i])) i++;
  return i;
};
function TextInput({
  value,
  onChange,
  onSubmit,
  placeholder = "",
  width = 40,
  history = [],
  submitOnPaste,
  onTab
}) {
  const theme = useTheme();
  const [cursorState, setCursorState] = useState3(value.length);
  const [anchorState, setAnchorState] = useState3(null);
  const [historyPos, setHistoryPos] = useState3(null);
  const draftRef = useRef2("");
  const offsetRef = useRef2(0);
  const cursor = Math.min(cursorState, value.length);
  const anchor = anchorState === null ? null : Math.min(anchorState, value.length);
  const selection = anchor !== null && anchor !== cursor ? [Math.min(anchor, cursor), Math.max(anchor, cursor)] : null;
  const place = (position, selecting = false) => {
    if (selecting) {
      if (anchor === null) setAnchorState(cursor);
    } else {
      setAnchorState(null);
    }
    setCursorState(Math.max(0, Math.min(value.length, position)));
  };
  const edit = (next, position) => {
    setAnchorState(null);
    setCursorState(Math.max(0, Math.min(next.length, position)));
    setHistoryPos(null);
    onChange(next);
  };
  const recall = (text) => {
    setAnchorState(null);
    setCursorState(text.length);
    onChange(text);
  };
  const removeRange = (start, end) => edit(value.slice(0, start) + value.slice(end), start);
  useInput((input, key) => {
    if (key.return) {
      onSubmit?.(value);
      return;
    }
    if (key.tab) {
      onTab?.();
      return;
    }
    if (key.pageUp || key.pageDown) return;
    if (key.escape) {
      setAnchorState(null);
      return;
    }
    if (key.upArrow || key.downArrow) {
      if (history.length === 0) return;
      if (key.upArrow) {
        if (historyPos === null) draftRef.current = value;
        const next2 = historyPos === null ? 0 : Math.min(historyPos + 1, history.length - 1);
        if (next2 === historyPos) return;
        setHistoryPos(next2);
        recall(history[next2]);
      } else if (historyPos !== null) {
        const next2 = historyPos - 1;
        setHistoryPos(next2 < 0 ? null : next2);
        recall(next2 < 0 ? draftRef.current : history[next2]);
      }
      return;
    }
    if (key.home) return place(0);
    if (key.end) return place(value.length);
    if (key.leftArrow || key.rightArrow) {
      const dir = key.leftArrow ? -1 : 1;
      if (selection && !key.shift) return place(dir < 0 ? selection[0] : selection[1]);
      const byWord = key.meta || key.ctrl;
      const target = byWord ? dir < 0 ? wordLeft(value, cursor) : wordRight(value, cursor) : cursor + dir;
      return place(target, key.shift);
    }
    if (key.backspace) {
      if (selection) return removeRange(selection[0], selection[1]);
      return removeRange(key.meta ? wordLeft(value, cursor) : Math.max(0, cursor - 1), cursor);
    }
    if (key.delete) {
      if (selection) return removeRange(selection[0], selection[1]);
      return removeRange(cursor, key.meta ? wordRight(value, cursor) : Math.min(value.length, cursor + 1));
    }
    if (key.ctrl) {
      if (input === "a") return place(0);
      if (input === "e") return place(value.length);
      if (input === "u") return removeRange(0, selection ? selection[1] : cursor);
      if (input === "k") return removeRange(selection ? selection[0] : cursor, value.length);
      if (input === "w") {
        const end2 = selection ? selection[1] : cursor;
        return removeRange(wordLeft(value, selection ? selection[0] : cursor), end2);
      }
      return;
    }
    if (key.meta) {
      if (input === "b") return place(wordLeft(value, cursor));
      if (input === "f") return place(wordRight(value, cursor));
      return;
    }
    if (!input) return;
    const clean = stripMouseReports(input).replace(/[\x00-\x1f\x7f]/g, "");
    if (!clean) return;
    const [start, end] = selection ?? [cursor, cursor];
    const next = value.slice(0, start) + clean + value.slice(end);
    edit(next, start + clean.length);
    if (clean.length > 1 && value === "" && submitOnPaste?.(next.trim())) onSubmit?.(next);
  });
  const span = Math.max(8, width);
  let offset = Math.min(offsetRef.current, Math.max(0, value.length + 1 - span));
  if (cursor < offset) offset = cursor;
  if (cursor > offset + span - 1) offset = cursor - span + 1;
  offsetRef.current = offset;
  if (!value) {
    return /* @__PURE__ */ jsxs5(Text6, { children: [
      /* @__PURE__ */ jsx7(Text6, { inverse: true, children: " " }),
      /* @__PURE__ */ jsx7(Text6, { color: theme.gray, dimColor: theme.dimSecondary, children: placeholder.slice(0, span - 1) })
    ] });
  }
  const cells = Array.from({ length: Math.min(span, value.length - offset + 1) }, (_, column) => {
    const index = offset + column;
    const selected = selection !== null && index >= selection[0] && index < selection[1];
    const atCursor = selection === null && index === cursor;
    return /* @__PURE__ */ jsx7(Text6, { color: theme.primary, inverse: selected || atCursor, children: value[index] ?? " " }, index);
  });
  return /* @__PURE__ */ jsx7(Text6, { children: cells });
}

// src/lib/click-map.ts
var ANSI_PATTERN = new RegExp(
  [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
  ].join("|"),
  "g"
);
var stripAnsi = (text) => text.replace(ANSI_PATTERN, "");
var frameLines = [];
function captureFrames(stream) {
  return new Proxy(stream, {
    get(target, prop) {
      if (prop === "write") {
        return (chunk, ...rest) => {
          const lines = String(chunk).split("\n").map(stripAnsi);
          if (lines.some((line) => line.trim() !== "")) frameLines = lines;
          return target.write(chunk, ...rest);
        };
      }
      const value = Reflect.get(target, prop);
      return typeof value === "function" ? value.bind(target) : value;
    }
  });
}
function clickTargetAt(x, y, targets) {
  for (const target of targets) {
    const { match, padX = 1, padY = 0 } = target;
    for (let row = y - 1 - padY; row <= y - 1 + padY; row++) {
      const line = frameLines[row];
      if (!line) continue;
      let index = line.indexOf(match);
      while (index !== -1) {
        if (x - 1 >= index - padX && x - 1 <= index + match.length - 1 + padX) return target;
        index = line.indexOf(match, index + 1);
      }
    }
  }
  return void 0;
}
function findFrameRow(text) {
  return frameLines.findIndex((line) => line.includes(text));
}
function frameRowSpan(row) {
  const line = frameLines[row];
  if (!line) return void 0;
  const first = line.search(/\S/);
  if (first === -1) return void 0;
  return [first + 1, line.trimEnd().length];
}

// src/lib/format.ts
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}
function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}\u2026` : text;
}
function shortenPath(filepath, homedir, max = 60) {
  const pretty = filepath.startsWith(homedir) ? `~${filepath.slice(homedir.length)}` : filepath;
  if (pretty.length <= max) return pretty;
  const ext = /\.\w{1,5}$/.exec(pretty)?.[0] ?? "";
  return `${pretty.slice(0, max - ext.length - 1)}\u2026${ext}`;
}
function wrapText(text, width) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= width) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
function formatSpeed(bytesPerSecond) {
  if (!Number.isFinite(bytesPerSecond) || bytesPerSecond <= 0) return "";
  return `${formatBytes(bytesPerSecond)}/s`;
}
function formatEta(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  return formatDuration(seconds);
}

// src/lib/history.ts
import fs from "fs";
import os from "os";
import path from "path";
var HISTORY_FILE = path.join(os.homedir(), ".config", "yoinks", "history.json");
var LIMIT = 50;
function loadHistory() {
  try {
    const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "string") : [];
  } catch {
    return [];
  }
}
function addToHistory(url) {
  const next = [url, ...loadHistory().filter((entry) => entry !== url)].slice(0, LIMIT);
  try {
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
    fs.writeFileSync(HISTORY_FILE, `${JSON.stringify(next, null, 2)}
`);
  } catch {
  }
  return next;
}

// src/lib/platforms.ts
var PLATFORMS = [
  { hosts: ["youtube.com", "youtu.be", "music.youtube.com"], platform: { key: "youtube", label: "YouTube" } },
  { hosts: ["x.com", "twitter.com"], platform: { key: "x", label: "X / Twitter" } },
  { hosts: ["instagram.com"], platform: { key: "instagram", label: "Instagram" } },
  { hosts: ["threads.net", "threads.com"], platform: { key: "threads", label: "Threads" } },
  { hosts: ["tiktok.com"], platform: { key: "tiktok", label: "TikTok" } },
  { hosts: ["vimeo.com"], platform: { key: "vimeo", label: "Vimeo" } },
  { hosts: ["twitch.tv"], platform: { key: "twitch", label: "Twitch" } },
  { hosts: ["reddit.com"], platform: { key: "reddit", label: "Reddit" } },
  { hosts: ["facebook.com", "fb.watch"], platform: { key: "facebook", label: "Facebook" } }
];
function detectPlatform(url) {
  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return { key: "unknown", label: "Unknown site" };
  }
  for (const { hosts, platform } of PLATFORMS) {
    if (hosts.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
      return platform;
    }
  }
  return { key: "generic", label: hostname };
}
function isProbablyUrl(input) {
  try {
    const u = new URL(input.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// src/lib/ytdlp.ts
import { spawn as spawn2 } from "child_process";
import { createWriteStream } from "fs";
import fs3 from "fs/promises";
import os3 from "os";
import path3 from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

// src/lib/gallerydl.ts
import { spawn } from "child_process";
import fs2 from "fs/promises";
import os2 from "os";
import path2 from "path";
var YOINKS_ROOT = path2.join(os2.homedir(), ".yoinks");
var YOINKS_BIN_DIR = path2.join(YOINKS_ROOT, "bin");
var GALLERYDL_ENV_DIR = path2.join(YOINKS_BIN_DIR, "gallery-dl");
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set(["avif", "bmp", "gif", "heic", "heif", "jpeg", "jpg", "jxl", "png", "tif", "tiff", "webp"]);
var VIDEO_EXTENSIONS = /* @__PURE__ */ new Set(["avi", "flv", "m2ts", "m4v", "mkv", "mov", "mp4", "mpeg", "mpg", "ts", "webm", "wmv"]);
var CHROME_EPOCH_OFFSET_MICROSECONDS = 116444736e8;
var instagramSessionByUrl = /* @__PURE__ */ new Map();
var CommandError = class extends Error {
  stderr;
  exitCode;
  constructor(message, stderr, exitCode) {
    super(message);
    this.name = "CommandError";
    this.stderr = stderr;
    this.exitCode = exitCode;
  }
};
function commandWorks(cmd, args2) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(cmd, args2, { stdio: "ignore", timeout: 1e4 });
    } catch {
      resolve(false);
      return;
    }
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}
function runCommand(cmd, args2, signal) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args2, { signal });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => stdout += chunk.toString());
    child.stderr.on("data", (chunk) => stderr += chunk.toString());
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new CommandError(cleanGalleryDlError(stderr) || `${path2.basename(cmd)} exited with code ${code}`, stderr, code));
    });
  });
}
async function findPython() {
  const candidates = process.platform === "win32" ? [
    { cmd: "py", prefix: ["-3"] },
    { cmd: "python3", prefix: [] },
    { cmd: "python", prefix: [] }
  ] : [
    { cmd: "python3", prefix: [] },
    { cmd: "python", prefix: [] }
  ];
  for (const candidate of candidates) {
    if (await commandWorks(candidate.cmd, [...candidate.prefix, "--version"])) return candidate;
  }
  return void 0;
}
function galleryDlPaths() {
  if (process.platform === "win32") {
    return {
      executable: path2.join(GALLERYDL_ENV_DIR, "Scripts", "gallery-dl.exe"),
      python: path2.join(GALLERYDL_ENV_DIR, "Scripts", "python.exe")
    };
  }
  return {
    executable: path2.join(GALLERYDL_ENV_DIR, "bin", "gallery-dl"),
    python: path2.join(GALLERYDL_ENV_DIR, "bin", "python")
  };
}
async function ensureGalleryDl(signal) {
  const local = galleryDlPaths();
  if (await commandWorks(local.executable, ["--version"])) return local.executable;
  const python = await findPython();
  if (!python) {
    if (await commandWorks("gallery-dl", ["--version"])) return "gallery-dl";
    throw new Error(
      "This link needs gallery-dl. Install Python 3, or run \u201Cbrew install gallery-dl\u201D (macOS/Linux), then try again."
    );
  }
  await fs2.mkdir(YOINKS_BIN_DIR, { recursive: true });
  await fs2.rm(GALLERYDL_ENV_DIR, { recursive: true, force: true });
  try {
    await runCommand(python.cmd, [...python.prefix, "-m", "venv", GALLERYDL_ENV_DIR], signal);
    await runCommand(
      local.python,
      ["-m", "pip", "install", "--disable-pip-version-check", "--upgrade", "gallery-dl"],
      signal
    );
  } catch (error) {
    throw new Error(
      `Could not install gallery-dl automatically. Run \u201Cbrew install gallery-dl\u201D and retry. ${error instanceof Error ? error.message : String(error)}`
    );
  }
  if (!await commandWorks(local.executable, ["--version"])) {
    throw new Error("gallery-dl was installed but could not be started. Run \u201Cbrew install gallery-dl\u201D and retry.");
  }
  return local.executable;
}
function isInstagramUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "instagram.com" || host.endsWith(".instagram.com");
  } catch {
    return false;
  }
}
function isInstagramPost(url) {
  try {
    return isInstagramUrl(url) && /^\/p\//.test(new URL(url).pathname);
  } catch {
    return false;
  }
}
function isInstagramReel(url) {
  try {
    return isInstagramUrl(url) && /^\/(reel|reels|tv)\//.test(new URL(url).pathname);
  } catch {
    return false;
  }
}
function chromeProfileRoot() {
  if (process.platform === "darwin") {
    return path2.join(os2.homedir(), "Library", "Application Support", "Google", "Chrome");
  }
  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA;
    return localAppData ? path2.join(localAppData, "Google", "Chrome", "User Data") : void 0;
  }
  return path2.join(os2.homedir(), ".config", "google-chrome");
}
async function chromeCookieDatabase(profileDir) {
  for (const candidate of [path2.join(profileDir, "Network", "Cookies"), path2.join(profileDir, "Cookies")]) {
    try {
      await fs2.access(candidate);
      return candidate;
    } catch {
    }
  }
  return void 0;
}
async function copyIfPresent(source, destination) {
  try {
    await fs2.copyFile(source, destination);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
async function hasValidInstagramSessionCookie(python, cookieDatabase, signal) {
  const tempDir = await fs2.mkdtemp(path2.join(os2.tmpdir(), "yoinks-cookies-"));
  const copiedDatabase = path2.join(tempDir, "Cookies");
  try {
    await fs2.copyFile(cookieDatabase, copiedDatabase);
    await copyIfPresent(`${cookieDatabase}-wal`, `${copiedDatabase}-wal`);
    await copyIfPresent(`${cookieDatabase}-shm`, `${copiedDatabase}-shm`);
    const nowChrome = Date.now() * 1e3 + CHROME_EPOCH_OFFSET_MICROSECONDS;
    const script = [
      "import sqlite3, sys",
      "db = sqlite3.connect(sys.argv[1])",
      `row = db.execute("SELECT 1 FROM cookies WHERE name='sessionid' AND host_key LIKE '%instagram.com' AND (expires_utc=0 OR expires_utc>?) LIMIT 1", (int(sys.argv[2]),)).fetchone()`,
      "print('1' if row else '0')"
    ].join("; ");
    const { stdout } = await runCommand(
      python.cmd,
      [...python.prefix, "-c", script, copiedDatabase, String(nowChrome)],
      signal
    );
    return stdout.trim() === "1";
  } catch {
    return false;
  } finally {
    await fs2.rm(tempDir, { recursive: true, force: true });
  }
}
async function readLastUsedChromeProfile(root) {
  try {
    const data = JSON.parse(await fs2.readFile(path2.join(root, "Local State"), "utf8"));
    return typeof data.profile?.last_used === "string" ? data.profile.last_used : void 0;
  } catch {
    return void 0;
  }
}
function orderChromeProfiles(profiles, lastUsed) {
  return [...profiles].sort((a, b) => {
    if (a === lastUsed) return -1;
    if (b === lastUsed) return 1;
    if (a === "Default") return -1;
    if (b === "Default") return 1;
    return a.localeCompare(b, void 0, { numeric: true });
  });
}
function chromeCookieSource(profile) {
  return `chrome/.instagram.com:${profile}`;
}
async function discoverLoggedInChromeSource(signal) {
  const root = chromeProfileRoot();
  const python = await findPython();
  if (!root || !python) return void 0;
  try {
    const entries = await fs2.readdir(root, { withFileTypes: true });
    const profileNames = entries.filter((entry) => entry.isDirectory() && (entry.name === "Default" || /^Profile \d+$/.test(entry.name))).map((entry) => entry.name);
    const ordered = orderChromeProfiles(profileNames, await readLastUsedChromeProfile(root));
    for (const name of ordered) {
      const cookieDatabase = await chromeCookieDatabase(path2.join(root, name));
      if (!cookieDatabase) continue;
      if (await hasValidInstagramSessionCookie(python, cookieDatabase, signal)) return chromeCookieSource(name);
    }
    return void 0;
  } catch {
    return void 0;
  }
}
async function instagramCookieSource(signal) {
  const configured = process.env.YOINKS_COOKIES_FROM_BROWSER?.trim();
  if (configured) return configured;
  return discoverLoggedInChromeSource(signal);
}
function metadataString(metadata, keys) {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return void 0;
}
function nestedMetadataString(value) {
  if (!value || typeof value !== "object") return void 0;
  return metadataString(value, ["username", "name", "account", "id"]);
}
function extensionFromUrl(value) {
  try {
    const ext = path2.extname(new URL(value).pathname).slice(1).toLowerCase();
    return ext || void 0;
  } catch {
    const ext = path2.extname(value.split("?")[0] ?? "").slice(1).toLowerCase();
    return ext || void 0;
  }
}
function collectGalleryItems(value, items) {
  if (Array.isArray(value)) {
    if (value[0] === 3 && typeof value[1] === "string") {
      const metadata = value[2] && typeof value[2] === "object" ? value[2] : {};
      const extension = metadataString(metadata, ["extension"])?.toLowerCase() ?? extensionFromUrl(value[1]);
      items.push({ url: value[1], extension, metadata });
      return;
    }
    for (const child of value) collectGalleryItems(child, items);
    return;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) collectGalleryItems(child, items);
  }
}
function parseGalleryJson(stdout) {
  const items = [];
  const trimmed = stdout.trim();
  if (!trimmed) return items;
  try {
    collectGalleryItems(JSON.parse(trimmed), items);
  } catch {
    for (const line of trimmed.split("\n")) {
      try {
        collectGalleryItems(JSON.parse(line), items);
      } catch {
      }
    }
  }
  const seen = /* @__PURE__ */ new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
function summarizeGallery(items) {
  let imageCount = 0;
  let videoCount = 0;
  for (const item of items) {
    if (item.extension && IMAGE_EXTENSIONS.has(item.extension)) imageCount++;
    else if (item.extension && VIDEO_EXTENSIONS.has(item.extension)) videoCount++;
  }
  return { count: items.length, imageCount, videoCount, otherCount: items.length - imageCount - videoCount };
}
function galleryTitle(items, url) {
  for (const item of items) {
    const title = metadataString(item.metadata, ["title", "description", "caption", "shortcode", "post_id", "id"]);
    if (title) return title.replace(/\s+/g, " ").slice(0, 120);
  }
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
}
function galleryUploader(items) {
  for (const item of items) {
    const direct = metadataString(item.metadata, ["username", "user", "author", "account"]);
    if (direct) return direct;
    for (const key of ["owner", "user", "author"]) {
      const nested = nestedMetadataString(item.metadata[key]);
      if (nested) return nested;
    }
  }
  return void 0;
}
function stripLogPrefix(line) {
  return line.replace(/^\[[^\]]+\](?:\[[^\]]+\])?\s*/, "").trim();
}
function cookieDiagnostic(stderr) {
  const lines = stderr.split("\n").map(stripLogPrefix).filter(Boolean).filter((line) => /cookie|decrypt|keyring|permission|database|profile|session/i.test(line)).filter((line) => /warning|error|fail|unable|denied|locked|missing|not found|invalid|expired|exception/i.test(line));
  const selected = [...new Set(lines)].slice(-2).join(" \xB7 ");
  return selected ? selected.slice(0, 420) : void 0;
}
function instagramDiagnostic(stderr) {
  const lines = stderr.split("\n").map(stripLogPrefix).filter(Boolean).filter((line) => !/^Extracted \d+ cookies from /i.test(line)).filter((line) => !/^(?:Cookie )?version breakdown:/i.test(line)).filter((line) => !/^Starting (?:Download|Simulation)Job/i.test(line)).filter((line) => !/^Using Instagram\w*Extractor/i.test(line));
  const failures = lines.filter(
    (line) => /warning|error|fail|invalid|expired|login|required|checkpoint|challenge|private|unavailable|not found|forbidden|unauthorized|redirect|\b(?:401|403|404|429|5\d\d)\b|too many requests|rate[ -]?limit/i.test(line)
  );
  const selected = [...new Set(failures)].slice(-3).join(" \xB7 ");
  return selected ? selected.slice(0, 600) : void 0;
}
function isRateLimitMessage(value) {
  return /\b429\b|too many requests|rate[ -]?limit/i.test(value);
}
function commandStderr(error) {
  return error instanceof CommandError ? error.stderr : error instanceof Error ? error.message : String(error);
}
async function probeGalleryItems(gallerydl, url, cookieSource, api, signal) {
  const args2 = [
    ...cookieSource ? ["--verbose"] : [],
    "-R",
    "0",
    "--sleep-request",
    "6.0-12.0",
    ...api ? ["-o", `extractor.instagram.api=${api}`] : [],
    "--dump-json",
    "--simulate",
    "--no-input",
    "--no-colors",
    ...cookieSource ? ["--cookies-from-browser", cookieSource] : [],
    url
  ];
  const { stdout, stderr } = await runCommand(gallerydl, args2, signal);
  return { items: parseGalleryJson(stdout), stderr };
}
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Operation cancelled."));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new Error("Operation cancelled."));
      },
      { once: true }
    );
  });
}
async function probeGallery(url, signal) {
  const gallerydl = await ensureGalleryDl(signal);
  if (!isInstagramUrl(url)) {
    const attempt = await probeGalleryItems(gallerydl, url, void 0, void 0, signal);
    if (attempt.items.length === 0) throw new Error("gallery-dl found no downloadable media at this link.");
    instagramSessionByUrl.delete(url);
    return {
      title: galleryTitle(attempt.items, url),
      uploader: galleryUploader(attempt.items),
      summary: summarizeGallery(attempt.items)
    };
  }
  const cookieSource = await instagramCookieSource(signal);
  if (!cookieSource) {
    throw new Error(
      "No Chrome profile with a valid Instagram session was found. Log in to instagram.com in Chrome, then retry, or set YOINKS_COOKIES_FROM_BROWSER to the logged-in browser profile."
    );
  }
  const diagnostics = [];
  for (const api of ["rest", "graphql"]) {
    try {
      const attempt = await probeGalleryItems(gallerydl, url, cookieSource, api, signal);
      if (attempt.items.length > 0) {
        instagramSessionByUrl.set(url, { cookieSource, api });
        return {
          title: galleryTitle(attempt.items, url),
          uploader: galleryUploader(attempt.items),
          summary: summarizeGallery(attempt.items)
        };
      }
      const diagnostic = instagramDiagnostic(attempt.stderr) ?? cookieDiagnostic(attempt.stderr);
      if (diagnostic) diagnostics.push(`${api}: ${diagnostic}`);
    } catch (error) {
      const stderr = commandStderr(error);
      if (isRateLimitMessage(stderr)) {
        throw new Error(
          `Instagram rate limit reached while using ${cookieSource}. Stop retrying now and wait before trying once again.`
        );
      }
      const diagnostic = instagramDiagnostic(stderr) ?? cookieDiagnostic(stderr);
      diagnostics.push(`${api}: ${diagnostic ?? (error instanceof Error ? error.message : String(error))}`);
    }
    if (api === "rest") await wait(6e3, signal);
  }
  const detail = diagnostics.at(-1);
  throw new Error(
    detail ? `Instagram returned no media using ${cookieSource}. ${detail}` : `Instagram cookies were read successfully from ${cookieSource}, but REST and GraphQL returned no downloadable media. Refresh the Instagram login in that Chrome profile and confirm the post is visible to the account.`
  );
}
function galleryChoices(summary) {
  const plural = (count, singular) => `${count} ${singular}${count === 1 ? "" : "s"}`;
  if (summary.imageCount > 0 && summary.videoCount > 0) {
    return [
      { label: `all media \xB7 ${plural(summary.count, "file")}`, mode: "all" },
      { label: `images only \xB7 ${plural(summary.imageCount, "image")}`, mode: "images" },
      { label: `videos only \xB7 ${plural(summary.videoCount, "video")}`, mode: "videos" }
    ];
  }
  if (summary.imageCount > 0) {
    return [{ label: `${plural(summary.imageCount, "image")} \xB7 original files`, mode: "images" }];
  }
  if (summary.videoCount > 0) {
    return [{ label: `${plural(summary.videoCount, "video")} \xB7 original files`, mode: "videos" }];
  }
  return [{ label: `${plural(summary.count, "file")} \xB7 original files`, mode: "all" }];
}
function safePathSegment(value) {
  const cleaned = value.normalize("NFKC").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").replace(/\s+/g, " ").replace(/[. ]+$/g, "").trim();
  return (cleaned || "gallery").slice(0, 80);
}
function galleryOutputDir(url, outDir) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const id = parts.at(-1);
    const host = parsed.hostname.replace(/^www\./, "").split(".")[0] || "gallery";
    return path2.join(outDir, safePathSegment(`${host}-${id || "gallery"}`));
  } catch {
    return path2.join(outDir, `gallery-${Date.now()}`);
  }
}
function galleryFilter(mode) {
  if (mode === "all") return [];
  const extensions = [...mode === "images" ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS].sort().map((ext) => `'${ext}'`).join(", ");
  return ["--filter", `extension and extension.lower() in (${extensions})`];
}
function withYtDlpOnPath(ytdlp) {
  if (!path2.isAbsolute(ytdlp)) return process.env;
  return {
    ...process.env,
    PATH: `${path2.dirname(ytdlp)}${path2.delimiter}${process.env.PATH ?? ""}`
  };
}
var activeChild;
process.on("exit", () => activeChild?.kill("SIGTERM"));
function downloadGallery(opts, onProcessing, signal) {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        const gallerydl = await ensureGalleryDl(signal);
        const targetDir = galleryOutputDir(opts.url, opts.outDir);
        const instagramSession = instagramSessionByUrl.get(opts.url);
        await fs2.mkdir(targetDir, { recursive: true });
        onProcessing();
        const args2 = [
          "--no-input",
          "--no-colors",
          "-R",
          "0",
          "--sleep-request",
          "6.0-12.0",
          "-D",
          targetDir,
          "--Print",
          "after:{_path}",
          "--Print",
          "skip:{_path}",
          ...instagramSession ? ["-o", `extractor.instagram.api=${instagramSession.api}`] : [],
          ...instagramSession ? ["--cookies-from-browser", instagramSession.cookieSource] : [],
          ...galleryFilter(opts.mode),
          opts.url
        ];
        const child = spawn(gallerydl, args2, { signal, env: withYtDlpOnPath(opts.ytdlp) });
        activeChild = child;
        let stderr = "";
        child.stderr.on("data", (chunk) => stderr += chunk.toString());
        child.on("error", reject);
        child.on("close", (code) => {
          activeChild = void 0;
          if (signal?.aborted) {
            reject(new Error("Download cancelled."));
            return;
          }
          if (code === 0) resolve(targetDir);
          else reject(new Error(cleanGalleryDlError(stderr) || `gallery-dl exited with code ${code}`));
        });
      } catch (error) {
        reject(error);
      }
    })();
  });
}
function cleanGalleryDlError(stderr) {
  const lines = stderr.split("\n").map((line) => line.trim()).filter(Boolean);
  const last = lines.filter((line) => /\[(error|warning)\]/i.test(line)).at(-1) ?? lines.at(-1);
  return last?.replace(/^\[[^\]]+\]\[(?:error|warning)\]\s*/i, "") ?? "";
}

// src/lib/ytdlp.ts
var YOINKS_DIR = path3.join(os3.homedir(), ".yoinks", "bin");
var RELEASE_BASE = "https://github.com/yt-dlp/yt-dlp/releases/latest/download";
var GALLERY_SENTINEL = "__yoinks_gallerydl__";
function ytDlpAssetName() {
  if (process.platform === "win32") return "yt-dlp.exe";
  if (process.platform === "darwin") return "yt-dlp_macos";
  return process.arch === "arm64" ? "yt-dlp_linux_aarch64" : "yt-dlp_linux";
}
function commandWorks2(cmd, args2) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn2(cmd, args2, { stdio: "ignore", timeout: 1e4 });
    } catch {
      resolve(false);
      return;
    }
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}
async function ensureYtDlp(onStatus, signal) {
  if (await commandWorks2("yt-dlp", ["--version"])) return "yt-dlp";
  const local = path3.join(YOINKS_DIR, process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp");
  if (await commandWorks2(local, ["--version"])) return local;
  onStatus("first run: fetching yt-dlp\u2026");
  await fs3.mkdir(YOINKS_DIR, { recursive: true });
  const url = `${RELEASE_BASE}/${ytDlpAssetName()}`;
  const response = await fetch(url, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`Could not download yt-dlp (${response.status}). Check your connection and try again.`);
  }
  const tmp = `${local}.download`;
  await pipeline(Readable.fromWeb(response.body), createWriteStream(tmp), { signal });
  await fs3.chmod(tmp, 493);
  await fs3.rename(tmp, local);
  return local;
}
async function findFfmpeg() {
  if (await commandWorks2("ffmpeg", ["-version"])) return void 0;
  try {
    const mod = await import("ffmpeg-static");
    const ffmpegPath = mod.default ?? mod;
    if (ffmpegPath && await commandWorks2(ffmpegPath, ["-version"])) return ffmpegPath;
  } catch {
  }
  return void 0;
}
async function probeVideo(ytdlp, url, signal) {
  const stdout = await new Promise((resolve, reject) => {
    const child = spawn2(ytdlp, ["-J", "--no-playlist", "--no-warnings", url], { signal });
    let out = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => out += chunk.toString());
    child.stderr.on("data", (chunk) => stderr += chunk.toString());
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(cleanYtDlpError(stderr) || `yt-dlp exited with code ${code}`));
      else resolve(out);
    });
  });
  let info;
  try {
    info = JSON.parse(stdout);
  } catch {
    throw new Error("Could not parse video info from yt-dlp.");
  }
  const infoJsonPath = path3.join(os3.tmpdir(), `yoinks-info-${process.pid}-${Date.now()}.json`);
  await fs3.writeFile(infoJsonPath, stdout);
  return { info, infoJsonPath };
}
async function galleryProbeResult(url, signal) {
  const gallery = await probeGallery(url, signal);
  const info = {
    title: gallery.title,
    uploader: gallery.uploader,
    webpage_url: url,
    extractor_key: "GalleryDL",
    gallery: gallery.summary
  };
  const infoJsonPath = path3.join(os3.tmpdir(), `yoinks-gallery-${process.pid}-${Date.now()}.json`);
  await fs3.writeFile(infoJsonPath, JSON.stringify(info));
  return { info, infoJsonPath };
}
async function probe(ytdlp, url, signal) {
  if (isInstagramReel(url)) return probeVideo(ytdlp, url, signal);
  if (isInstagramPost(url)) {
    let galleryError;
    try {
      const result = await galleryProbeResult(url, signal);
      const summary = result.info.gallery;
      const singleVideo = summary.count === 1 && summary.videoCount === 1 && summary.imageCount === 0;
      if (!singleVideo) return result;
    } catch (error) {
      galleryError = error;
    }
    try {
      return await probeVideo(ytdlp, url, signal);
    } catch (videoError2) {
      throw new Error(combineProbeErrors(videoError2, galleryError));
    }
  }
  let videoError;
  try {
    return await probeVideo(ytdlp, url, signal);
  } catch (error) {
    videoError = error;
  }
  try {
    return await galleryProbeResult(url, signal);
  } catch (galleryError) {
    throw new Error(combineProbeErrors(videoError, galleryError));
  }
}
function combineProbeErrors(videoError, galleryError) {
  const video = videoError instanceof Error ? videoError.message : String(videoError ?? "");
  const gallery = galleryError instanceof Error ? galleryError.message : String(galleryError ?? "");
  return gallery ? `${video} Gallery fallback: ${gallery}`.trim() : video;
}
var MAX_VIDEO_CHOICES = 8;
function buildChoices(info) {
  if (info.gallery) {
    return galleryChoices(info.gallery).map((choice) => ({
      kind: "video",
      label: choice.label,
      args: [GALLERY_SENTINEL, choice.mode]
    }));
  }
  const formats = info.formats ?? [];
  const choices = [];
  const audioOnly = formats.filter((f) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none"));
  const bestAudio = [...audioOnly].sort((a, b) => (b.abr ?? b.tbr ?? 0) - (a.abr ?? a.tbr ?? 0))[0];
  const audioSize = bestAudio?.filesize ?? bestAudio?.filesize_approx;
  const videos = formats.filter((f) => f.vcodec && f.vcodec !== "none" && f.height);
  const heights = [...new Set(videos.map((f) => f.height))].sort((a, b) => b - a);
  for (const height of heights.slice(0, MAX_VIDEO_CHOICES)) {
    const candidates = videos.filter((f) => f.height === height);
    const best = [...candidates].sort((a, b) => scoreVideo(b) - scoreVideo(a))[0];
    const muxed = best.acodec && best.acodec !== "none";
    const size = (best.filesize ?? best.filesize_approx ?? 0) + (muxed ? 0 : audioSize ?? 0);
    const sizeLabel = size > 0 ? ` \xB7 ~${formatBytes(size)}` : "";
    choices.push({
      kind: "video",
      label: `${height}p \xB7 mp4${sizeLabel}`,
      args: [
        "-f",
        `bv*[height=${height}]+ba/b[height=${height}]/bv*[height<=${height}]+ba/b`,
        "--merge-output-format",
        "mp4"
      ]
    });
  }
  if (choices.length === 0) {
    choices.push({
      kind: "video",
      label: "best available \xB7 mp4",
      args: ["-f", "bv*+ba/b", "--merge-output-format", "mp4"]
    });
  }
  const audioSizeLabel = audioSize ? ` \xB7 ~${formatBytes(audioSize)}` : "";
  choices.push({
    kind: "audio",
    label: `audio only \xB7 mp3${audioSizeLabel}`,
    args: ["-f", "ba/b", "-x", "--audio-format", "mp3", "--audio-quality", "0"]
  });
  return choices;
}
function scoreVideo(f) {
  let score = f.tbr ?? 0;
  if (f.ext === "mp4") score += 1e4;
  if (f.vcodec?.startsWith("avc")) score += 5e3;
  return score;
}
var PROGRESS_PREFIX = "YOINK|";
var PROGRESS_TEMPLATE = `${PROGRESS_PREFIX}%(progress.downloaded_bytes)s|%(progress.total_bytes)s|%(progress.total_bytes_estimate)s|%(progress.speed)s|%(progress.eta)s`;
var activeChild2;
process.on("exit", () => activeChild2?.kill("SIGTERM"));
function galleryMode(choice) {
  if (choice.args[0] !== GALLERY_SENTINEL) return void 0;
  const mode = choice.args[1];
  return mode === "images" || mode === "videos" ? mode : "all";
}
function download(opts, handlers, signal) {
  const mode = galleryMode(opts.choice);
  if (mode) {
    return downloadGallery(
      { ytdlp: opts.ytdlp, url: opts.url, mode, outDir: opts.outDir },
      handlers.onProcessing,
      signal
    );
  }
  const args2 = [
    ...opts.infoJsonPath ? ["--load-info-json", opts.infoJsonPath] : [opts.url],
    ...opts.choice.args,
    "--no-playlist",
    "--no-warnings",
    "--newline",
    "--no-quiet",
    "--progress",
    "--progress-template",
    `download:${PROGRESS_TEMPLATE}`,
    "--print",
    "after_move:filepath",
    "--no-simulate",
    "-o",
    path3.join(opts.outDir, "%(title).60s.%(ext)s")
  ];
  if (opts.ffmpegLocation) args2.push("--ffmpeg-location", opts.ffmpegLocation);
  return new Promise((resolve, reject) => {
    const child = spawn2(opts.ytdlp, args2, { signal });
    activeChild2 = child;
    let stderr = "";
    let filepath = "";
    let part = 0;
    let totalParts = 1;
    let lastDownloaded = 0;
    let buffer = "";
    const destinations = [];
    child.stdout.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        if (line.startsWith(PROGRESS_PREFIX)) {
          const [downloaded, total, totalEstimate, speed, eta] = line.slice(PROGRESS_PREFIX.length).split("|");
          const downloadedBytes = toNumber(downloaded) ?? 0;
          if (downloadedBytes < lastDownloaded) part++;
          lastDownloaded = downloadedBytes;
          handlers.onProgress({
            downloadedBytes,
            totalBytes: toNumber(total) ?? toNumber(totalEstimate),
            speed: toNumber(speed),
            eta: toNumber(eta),
            part,
            totalParts
          });
        } else if (line.includes("Downloading 1 format(s):")) {
          totalParts = (line.split("format(s):")[1] ?? "").trim().split("+").length;
        } else if (line.includes("[Merger]") || line.includes("[ExtractAudio]")) {
          const merging = /^\[Merger\] Merging formats into "(.+)"$/.exec(line)?.[1];
          const extracting = /^\[ExtractAudio\] Destination: (.+)$/.exec(line)?.[1];
          const target = merging ?? extracting;
          if (target) destinations.push(target);
          handlers.onProcessing();
        } else if (line.startsWith("[download] Destination: ")) {
          destinations.push(line.slice("[download] Destination: ".length));
        } else if (path3.isAbsolute(line)) {
          filepath = line;
        }
      }
    });
    child.stderr.on("data", (chunk) => stderr += chunk.toString());
    child.on("error", reject);
    child.on("close", (code) => {
      activeChild2 = void 0;
      if (signal?.aborted) {
        void removePartials(destinations);
        reject(new Error("Download cancelled."));
        return;
      }
      if (code === 0 && filepath) resolve(filepath);
      else reject(new Error(cleanYtDlpError(stderr) || `Download failed (yt-dlp exit code ${code}).`));
    });
  });
}
function removePartials(destinations) {
  return Promise.allSettled(
    destinations.flatMap((dest) => [dest, `${dest}.part`, `${dest}.ytdl`]).map((file) => fs3.rm(file, { force: true }))
  );
}
function toNumber(value) {
  if (!value || value === "NA" || value === "None") return void 0;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : void 0;
}
function cleanYtDlpError(stderr) {
  const lines = stderr.split("\n").map((line) => line.trim()).filter((line) => line.startsWith("ERROR:"));
  const last = lines.at(-1);
  return last ? last.replace(/^ERROR:\s*(\[[^\]]+\]\s*)?/, "") : "";
}

// src/app.tsx
import { Fragment as Fragment2, jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var OUT_DIR = path4.join(os4.homedir(), "Downloads");
var YOINK_BUTTON = "yoink";
var DONE_LABEL = "\u21B5 yoink another";
var TAGLINE = "yoink any video. paste. yoink. done.";
var choiceLabel = (choice) => `${choice.kind === "audio" ? "\u266A " : "\u25B6 "}${choice.label}`;
function ChoiceIndicator({ isSelected }) {
  const theme = useTheme();
  return /* @__PURE__ */ jsx8(Box5, { marginRight: 1, children: /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: isSelected ? "\u276F" : " " }) });
}
function ChoiceItem({ isSelected, label }) {
  const theme = useTheme();
  return /* @__PURE__ */ jsx8(Text7, { color: theme.primary, bold: isSelected, children: label });
}
var Gap = ({ lines = 1 }) => /* @__PURE__ */ jsx8(Box5, { flexDirection: "column", flexShrink: 0, children: Array.from({ length: lines }, (_, i) => /* @__PURE__ */ jsx8(Text7, { children: " " }, i)) });
function partLabel(progress) {
  return progress.totalParts > 1 ? `part ${progress.part + 1}/${progress.totalParts}  ` : "";
}
function downloadMeta(progress) {
  const speed = progress.speed ? formatSpeed(progress.speed) : "";
  const eta = progress.eta ? `${formatEta(progress.eta)} left` : "";
  return `${partLabel(progress)}${speed.padStart(10)}  ${eta.padEnd(12)}`;
}
function indeterminateMeta(progress) {
  const bytes = formatBytes(progress.downloadedBytes);
  const speed = progress.speed ? formatSpeed(progress.speed) : "";
  return `${partLabel(progress)}${bytes.padStart(8)}  ${speed.padEnd(10)}`;
}
var HINTS = {
  input: [
    ["\u21B5", "yoink"],
    ["^c", "quit"]
  ],
  probing: [
    ["esc", "cancel"],
    ["^c", "quit"]
  ],
  picking: [
    ["\u2191\u2193", "choose"],
    ["\u21B5", "yoink"],
    ["esc", "back"],
    ["^c", "quit"]
  ],
  downloading: [
    ["esc", "cancel"],
    ["^c", "quit"]
  ],
  done: [["^c", "quit"]],
  error: [
    ["\u21B5", "try again"],
    ["^c", "quit"]
  ]
};
function App({ initialThemeMode: initialThemeMode2 = "auto", ...props }) {
  const [themeMode, setThemeMode] = useState4(initialThemeMode2);
  const cycleTheme = useCallback(() => {
    setThemeMode(nextThemeMode);
  }, []);
  return /* @__PURE__ */ jsx8(ThemeProvider, { mode: themeMode, children: /* @__PURE__ */ jsx8(AppContent, { ...props, cycleTheme }) });
}
function AppContent({
  initialUrl: initialUrl2,
  clipboardUrl: clipboardUrl2,
  onOutcome,
  cycleTheme
}) {
  const theme = useTheme();
  const { exit } = useApp();
  const { stdout } = useStdout3();
  const [url, setUrl] = useState4(initialUrl2 ?? "");
  const [urlInput, setUrlInput] = useState4("");
  const [history, setHistory] = useState4(loadHistory);
  const [platform, setPlatform] = useState4();
  const [info, setInfo] = useState4();
  const [choices, setChoices] = useState4([]);
  const ytdlpRef = useRef3("");
  const highlightRef = useRef3(0);
  const infoJsonRef = useRef3(void 0);
  const abortRef = useRef3(void 0);
  const [phase, setPhase] = useState4(initialUrl2 ? { name: "probing", status: "warming up\u2026" } : { name: "input" });
  const columns = stdout?.columns && stdout.columns > 0 ? stdout.columns : 80;
  const boxWidth = Math.max(14, Math.min(64, columns - 6));
  const contentWidth = Math.max(10, Math.min(columns - 4, 78));
  const startProbe = useCallback(async (targetUrl) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setPlatform(detectPlatform(targetUrl));
    setPhase({ name: "probing", status: "warming up\u2026" });
    try {
      const ytdlp = ytdlpRef.current || await ensureYtDlp((status) => setPhase({ name: "probing", status }), controller.signal);
      ytdlpRef.current = ytdlp;
      if (controller.signal.aborted) return;
      setPhase({ name: "probing", status: "fetching video info\u2026" });
      const { info: videoInfo, infoJsonPath } = await probe(ytdlp, targetUrl, controller.signal);
      if (controller.signal.aborted) return;
      infoJsonRef.current = infoJsonPath;
      setInfo(videoInfo);
      setChoices(buildChoices(videoInfo));
      highlightRef.current = 0;
      setPhase({ name: "picking" });
    } catch (error) {
      if (controller.signal.aborted) return;
      setPhase({ name: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }, []);
  useEffect4(() => {
    if (initialUrl2) void startProbe(initialUrl2);
  }, [initialUrl2, startProbe]);
  const resetToInput = useCallback(() => {
    setUrl("");
    setUrlInput("");
    setPlatform(void 0);
    setInfo(void 0);
    setChoices([]);
    setPhase({ name: "input" });
  }, []);
  const cancelRun = useCallback(() => {
    abortRef.current?.abort();
    resetToInput();
    setUrlInput(url);
  }, [resetToInput, url]);
  useInput2(
    (input, key) => {
      if (key.ctrl && input === "t") {
        cycleTheme();
        return;
      }
      if (key.escape && (phase.name === "picking" || phase.name === "error" || phase.name === "done")) resetToInput();
      if (key.escape && (phase.name === "probing" || phase.name === "downloading")) cancelRun();
      if (key.return && (phase.name === "error" || phase.name === "done")) resetToInput();
    },
    { isActive: Boolean(process.stdin.isTTY) }
  );
  const handleUrlSubmit = (value) => {
    const trimmed = value.trim();
    if (!isProbablyUrl(trimmed)) {
      setPhase({ name: "input", warning: "that doesn\u2019t look like a link \u2014 paste a full url" });
      return;
    }
    setUrl(trimmed);
    void startProbe(trimmed);
  };
  const clipboardOffered = Boolean(clipboardUrl2) && urlInput === "";
  const clipboardAccepted = Boolean(clipboardUrl2) && urlInput === clipboardUrl2;
  const handlePick = (item) => {
    const choice = choices[item.value];
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase({ name: "downloading", choice, processing: false });
    void (async () => {
      const handlers = {
        onProgress: (progress) => setPhase((prev) => prev.name === "downloading" ? { ...prev, progress, processing: false } : prev),
        onProcessing: () => setPhase((prev) => prev.name === "downloading" ? { ...prev, processing: true } : prev)
      };
      try {
        const ffmpegLocation = await findFfmpeg();
        const base = { ytdlp: ytdlpRef.current, ffmpegLocation, url, choice, outDir: OUT_DIR };
        let filepath;
        try {
          filepath = await download({ ...base, infoJsonPath: infoJsonRef.current }, handlers, controller.signal);
        } catch (error) {
          if (controller.signal.aborted) throw error;
          setPhase(
            (prev) => prev.name === "downloading" ? { ...prev, progress: void 0, refreshing: true } : prev
          );
          filepath = await download(base, handlers, controller.signal);
        }
        onOutcome({ filepath });
        setHistory(addToHistory(url));
        setPhase({ name: "done", filepath });
      } catch (error) {
        if (controller.signal.aborted) return;
        setPhase({ name: "error", message: error instanceof Error ? error.message : String(error) });
      }
    })();
  };
  let hints = [...HINTS[phase.name], ["^t", `theme:${theme.mode}`]];
  if (phase.name === "input" && history.length > 0) {
    hints = [hints[0], ["\u2191", "history"], ...hints.slice(1)];
  }
  const hintAction = (key) => {
    if (key === "^c") return () => exit();
    if (key === "^t") return cycleTheme;
    if (key === "esc") return phase.name === "probing" || phase.name === "downloading" ? cancelRun : resetToInput;
    if (key === "\u21B5") {
      if (phase.name === "input") return () => handleUrlSubmit(urlInput);
      if (phase.name === "picking") return () => handlePick({ value: highlightRef.current });
      if (phase.name === "error" || phase.name === "done") return resetToInput;
    }
    return void 0;
  };
  const clickTargets = [];
  if (phase.name === "input") {
    clickTargets.push({ match: `  ${YOINK_BUTTON}  `, padY: 1, action: () => handleUrlSubmit(urlInput) });
  }
  if (phase.name === "picking") {
    for (const [index, choice] of choices.entries()) {
      clickTargets.push({ match: choiceLabel(choice), action: () => handlePick({ value: index }) });
    }
  }
  if (phase.name === "done") {
    clickTargets.push({ match: DONE_LABEL, padX: 4, padY: 1, action: resetToInput });
  }
  for (const [key, label] of hints) {
    const action = hintAction(key);
    if (action) clickTargets.push({ match: `${key} ${label}`, action });
  }
  useMouseClick(
    (x, y) => {
      const taglineRow = findFrameRow(TAGLINE);
      if (taglineRow > 3 && y - 1 >= taglineRow - 4 && y - 1 <= taglineRow - 2) {
        const span = frameRowSpan(y - 1);
        if (span && x >= span[0] - 1 && x <= span[1] + 1) {
          if (phase.name === "probing" || phase.name === "downloading") cancelRun();
          else if (phase.name !== "input") resetToInput();
          return;
        }
      }
      clickTargetAt(x, y, clickTargets)?.action();
    },
    Boolean(process.stdin.isTTY)
  );
  return /* @__PURE__ */ jsxs6(FullScreen, { children: [
    /* @__PURE__ */ jsx8(Logo, {}),
    /* @__PURE__ */ jsx8(Gap, {}),
    /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: TAGLINE }),
    /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: "youtube \xB7 x \xB7 instagram \xB7 threads \xB7 tiktok \xB7 +1800 more" }),
    /* @__PURE__ */ jsx8(Gap, {}),
    phase.name === "input" && /* @__PURE__ */ jsxs6(Box5, { flexDirection: "column", alignItems: "center", children: [
      /* @__PURE__ */ jsx8(FramedInput, { title: "Paste a link", width: boxWidth, button: YOINK_BUTTON, children: /* @__PURE__ */ jsx8(
        TextInput,
        {
          value: urlInput,
          onChange: setUrlInput,
          onSubmit: handleUrlSubmit,
          placeholder: "https://youtube.com/watch?v=\u2026",
          width: boxWidth - 6,
          history,
          submitOnPaste: isProbablyUrl,
          onTab: () => {
            if (clipboardOffered) setUrlInput(clipboardUrl2);
          }
        }
      ) }),
      phase.warning ? /* @__PURE__ */ jsxs6(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: [
        "\u2717 ",
        phase.warning
      ] }) : clipboardOffered ? /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: "link in your clipboard \u2014 \u21E5 to paste it" }) : clipboardAccepted ? /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: "from your clipboard \u2014 \u21B5 to yoink it" }) : null
    ] }),
    phase.name === "probing" && /* @__PURE__ */ jsx8(Box5, { flexDirection: "column", alignItems: "center", children: /* @__PURE__ */ jsx8(FramedInput, { title: platform ? platform.label : "Paste a link", width: boxWidth, button: YOINK_BUTTON, buttonDim: true, children: /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: url.length > boxWidth - 8 ? `${url.slice(0, boxWidth - 9)}\u2026` : url }) }) }),
    phase.name === "picking" && platform && /* @__PURE__ */ jsxs6(Box5, { width: contentWidth, children: [
      /* @__PURE__ */ jsxs6(Box5, { flexDirection: "column", flexGrow: 1, flexBasis: 0, paddingTop: 1, paddingRight: 3, children: [
        wrapText(info?.title ?? "", Math.max(10, contentWidth - 41)).map((line, index) => /* @__PURE__ */ jsx8(Text7, { bold: true, color: theme.primary, children: line }, index)),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsxs6(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: [
          "\u25B8 ",
          platform.label,
          info?.duration ? ` \xB7 ${formatDuration(info.duration)}` : "",
          info?.uploader ? ` \xB7 ${info.uploader}` : ""
        ] })
      ] }),
      /* @__PURE__ */ jsx8(Panel, { title: "Download", width: 38, children: /* @__PURE__ */ jsx8(
        SelectInput,
        {
          indicatorComponent: ChoiceIndicator,
          itemComponent: ChoiceItem,
          items: choices.map((choice, index) => ({
            key: String(index),
            label: choiceLabel(choice),
            value: index
          })),
          onSelect: handlePick,
          onHighlight: (item) => highlightRef.current = item.value
        }
      ) })
    ] }),
    phase.name === "downloading" && /* @__PURE__ */ jsxs6(Box5, { flexDirection: "column", alignItems: "center", children: [
      /* @__PURE__ */ jsxs6(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: [
        info?.title ? `${truncate(info.title, 42)} \xB7 ` : "",
        phase.choice.label
      ] }),
      /* @__PURE__ */ jsx8(Gap, {}),
      phase.processing ? /* @__PURE__ */ jsxs6(Fragment2, { children: [
        /* @__PURE__ */ jsx8(ProgressBar, { percent: 1 }),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsxs6(Text7, { children: [
          /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
          /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: " processing\u2026" })
        ] })
      ] }) : phase.progress?.totalBytes ? /* @__PURE__ */ jsxs6(Fragment2, { children: [
        /* @__PURE__ */ jsx8(ProgressBar, { percent: phase.progress.downloadedBytes / phase.progress.totalBytes }),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: downloadMeta(phase.progress) })
      ] }) : phase.progress ? /* @__PURE__ */ jsxs6(Fragment2, { children: [
        /* @__PURE__ */ jsxs6(Text7, { children: [
          /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
          /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: " downloading\u2026" })
        ] }),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: indeterminateMeta(phase.progress) })
      ] }) : /* @__PURE__ */ jsxs6(Fragment2, { children: [
        /* @__PURE__ */ jsx8(ProgressBar, { percent: 0 }),
        /* @__PURE__ */ jsx8(Gap, {}),
        /* @__PURE__ */ jsxs6(Text7, { children: [
          /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
          /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: phase.refreshing ? " link expired \u2014 grabbing a fresh one\u2026" : " starting download\u2026" })
        ] })
      ] })
    ] }),
    phase.name === "done" && /* @__PURE__ */ jsxs6(Box5, { flexDirection: "column", alignItems: "center", children: [
      /* @__PURE__ */ jsxs6(Text7, { children: [
        /* @__PURE__ */ jsx8(Text7, { bold: true, color: theme.primary, children: "\u2713 yoinked! " }),
        /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: "find your file in:" })
      ] }),
      /* @__PURE__ */ jsx8(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: shortenPath(phase.filepath, os4.homedir(), 60) }),
      /* @__PURE__ */ jsx8(Gap, {}),
      /* @__PURE__ */ jsx8(
        Box5,
        {
          borderStyle: "round",
          borderColor: theme.gray,
          borderDimColor: theme.dimSecondary,
          borderBackgroundColor: theme.background,
          paddingX: 3,
          children: /* @__PURE__ */ jsx8(Text7, { bold: true, color: theme.primary, children: DONE_LABEL })
        }
      )
    ] }),
    phase.name === "error" && /* @__PURE__ */ jsx8(Box5, { flexDirection: "column", alignItems: "center", width: Math.max(10, Math.min(columns - 6, 72)), children: /* @__PURE__ */ jsxs6(Text7, { bold: true, color: theme.primary, children: [
      "\u2717 ",
      phase.message
    ] }) }),
    hints.length > 0 ? /* @__PURE__ */ jsxs6(Fragment2, { children: [
      /* @__PURE__ */ jsx8(Gap, { lines: 2 }),
      /* @__PURE__ */ jsx8(
        Shortcuts,
        {
          items: hints,
          leading: phase.name === "probing" ? /* @__PURE__ */ jsxs6(Text7, { children: [
            /* @__PURE__ */ jsx8(Text7, { color: theme.primary, children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
            /* @__PURE__ */ jsxs6(Text7, { color: theme.gray, dimColor: theme.dimSecondary, children: [
              " ",
              phase.status
            ] })
          ] }) : void 0
        }
      )
    ] }) : null
  ] });
}

// src/lib/args.ts
function parseArgs(args2) {
  const result = { help: false, version: false };
  const positional = [];
  for (let index = 0; index < args2.length; index++) {
    const arg = args2[index];
    if (arg === "-h" || arg === "--help") {
      result.help = true;
    } else if (arg === "-v" || arg === "--version") {
      result.version = true;
    } else if (arg === "--update-tools") {
      result.updateTools = true;
    } else if (arg === "--theme") {
      const value = args2[++index];
      if (!value) return { ...result, error: "--theme needs a value: auto, light, or dark" };
      if (!isThemeMode(value)) return { ...result, error: `unknown theme \u201C${value}\u201D \u2014 use auto, light, or dark` };
      result.themeMode = value;
    } else if (arg.startsWith("--theme=")) {
      const value = arg.slice("--theme=".length);
      if (!isThemeMode(value)) return { ...result, error: `unknown theme \u201C${value}\u201D \u2014 use auto, light, or dark` };
      result.themeMode = value;
    } else if (arg.startsWith("-")) {
      return { ...result, error: `unknown option \u201C${arg}\u201D` };
    } else {
      positional.push(arg);
    }
  }
  if (positional.length > 1) return { ...result, error: "expected a single url" };
  if (result.updateTools && positional.length > 0) {
    return { ...result, error: "--update-tools cannot be combined with a url" };
  }
  result.initialUrl = positional[0];
  return result;
}

// src/lib/clipboard.ts
import { execFileSync } from "child_process";
var COMMANDS = process.platform === "darwin" ? [["pbpaste", []]] : process.platform === "win32" ? [["powershell", ["-NoProfile", "-Command", "Get-Clipboard"]]] : [
  ["wl-paste", ["--no-newline"]],
  ["xclip", ["-selection", "clipboard", "-o"]],
  ["xsel", ["--clipboard", "--output"]]
];
function readClipboard() {
  for (const [command, args2] of COMMANDS) {
    try {
      return execFileSync(command, args2, { encoding: "utf8", timeout: 500, stdio: ["ignore", "pipe", "ignore"] });
    } catch {
    }
  }
  return "";
}

// src/lib/updater.ts
import { spawn as spawn3 } from "child_process";
import { createWriteStream as createWriteStream2 } from "fs";
import fs4 from "fs/promises";
import os5 from "os";
import path5 from "path";
import { Readable as Readable2 } from "stream";
import { pipeline as pipeline2 } from "stream/promises";
var BIN_DIR = path5.join(os5.homedir(), ".yoinks", "bin");
var YTDLP_PATH = path5.join(BIN_DIR, process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp");
var GALLERYDL_DIR = path5.join(BIN_DIR, "gallery-dl");
var GALLERYDL_NEXT_DIR = path5.join(BIN_DIR, "gallery-dl.next");
var RELEASE_BASE2 = "https://github.com/yt-dlp/yt-dlp/releases/latest/download";
function commandWorks3(cmd, args2) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn3(cmd, args2, { stdio: "ignore", timeout: 15e3 });
    } catch {
      resolve(false);
      return;
    }
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}
function runCommand2(cmd, args2, signal) {
  return new Promise((resolve, reject) => {
    const child = spawn3(cmd, args2, { signal, stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => stderr += chunk.toString());
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `${path5.basename(cmd)} exited with code ${code}`));
    });
  });
}
function ytDlpAssetName2() {
  if (process.platform === "win32") return "yt-dlp.exe";
  if (process.platform === "darwin") return "yt-dlp_macos";
  return process.arch === "arm64" ? "yt-dlp_linux_aarch64" : "yt-dlp_linux";
}
async function replaceFile(next, current) {
  const previous = `${current}.previous`;
  await fs4.rm(previous, { force: true });
  let hasPrevious = false;
  try {
    await fs4.rename(current, previous);
    hasPrevious = true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  try {
    await fs4.rename(next, current);
    await fs4.rm(previous, { force: true });
  } catch (error) {
    await fs4.rm(current, { force: true });
    if (hasPrevious) await fs4.rename(previous, current);
    throw error;
  }
}
async function updateYtDlp(onStatus, signal) {
  onStatus("downloading latest yt-dlp\u2026");
  await fs4.mkdir(BIN_DIR, { recursive: true });
  const next = `${YTDLP_PATH}.next`;
  await fs4.rm(next, { force: true });
  try {
    const response = await fetch(`${RELEASE_BASE2}/${ytDlpAssetName2()}`, { signal });
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
    await pipeline2(Readable2.fromWeb(response.body), createWriteStream2(next), { signal });
    await fs4.chmod(next, 493);
    if (!await commandWorks3(next, ["--version"])) throw new Error("downloaded yt-dlp could not be started");
    await replaceFile(next, YTDLP_PATH);
  } catch (error) {
    await fs4.rm(next, { force: true });
    throw new Error(`Could not update yt-dlp: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function pythonCandidates() {
  const configured = process.env.YOINKS_PYTHON?.trim();
  if (process.platform === "win32") {
    return [
      ...configured ? [{ cmd: configured, prefix: [] }] : [],
      { cmd: "py", prefix: ["-3"] },
      { cmd: "python3", prefix: [] },
      { cmd: "python", prefix: [] }
    ];
  }
  return [
    ...configured ? [{ cmd: configured, prefix: [] }] : [],
    ...process.platform === "darwin" ? [
      { cmd: "/opt/homebrew/bin/python3", prefix: [] },
      { cmd: "/usr/local/bin/python3", prefix: [] }
    ] : [],
    { cmd: "python3", prefix: [] },
    { cmd: "python", prefix: [] }
  ];
}
async function findPython2() {
  const check = [
    "import ssl, sys",
    "assert sys.version_info >= (3, 10), 'Python 3.10+ required'",
    "assert 'OpenSSL' in ssl.OPENSSL_VERSION, ssl.OPENSSL_VERSION"
  ].join("; ");
  for (const candidate of pythonCandidates()) {
    if (await commandWorks3(candidate.cmd, [...candidate.prefix, "-c", check])) return candidate;
  }
  return void 0;
}
function galleryDlPaths2(root) {
  if (process.platform === "win32") {
    return {
      python: path5.join(root, "Scripts", "python.exe"),
      executable: path5.join(root, "Scripts", "gallery-dl.exe")
    };
  }
  return {
    python: path5.join(root, "bin", "python"),
    executable: path5.join(root, "bin", "gallery-dl")
  };
}
async function replaceDirectory(next, current) {
  const previous = `${current}.previous`;
  await fs4.rm(previous, { recursive: true, force: true });
  let hasPrevious = false;
  try {
    await fs4.rename(current, previous);
    hasPrevious = true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  try {
    await fs4.rename(next, current);
    await fs4.rm(previous, { recursive: true, force: true });
  } catch (error) {
    await fs4.rm(current, { recursive: true, force: true });
    if (hasPrevious) await fs4.rename(previous, current);
    throw error;
  }
}
async function updateGalleryDl(onStatus, signal) {
  const python = await findPython2();
  if (!python) {
    throw new Error("Could not update gallery-dl: Python 3.10+ linked with OpenSSL is required. On macOS run \u201Cbrew install python\u201D.");
  }
  onStatus("installing latest gallery-dl\u2026");
  await fs4.mkdir(BIN_DIR, { recursive: true });
  await fs4.rm(GALLERYDL_NEXT_DIR, { recursive: true, force: true });
  const next = galleryDlPaths2(GALLERYDL_NEXT_DIR);
  try {
    await runCommand2(python.cmd, [...python.prefix, "-m", "venv", GALLERYDL_NEXT_DIR], signal);
    await runCommand2(
      next.python,
      ["-m", "pip", "install", "--disable-pip-version-check", "--upgrade", "gallery-dl"],
      signal
    );
    if (!await commandWorks3(next.executable, ["--version"])) {
      throw new Error("new gallery-dl environment could not be started");
    }
    await replaceDirectory(GALLERYDL_NEXT_DIR, GALLERYDL_DIR);
  } catch (error) {
    await fs4.rm(GALLERYDL_NEXT_DIR, { recursive: true, force: true });
    throw new Error(`Could not update gallery-dl: ${error instanceof Error ? error.message : String(error)}`);
  }
}
async function updateDownloaders(onStatus, signal) {
  await updateYtDlp(onStatus, signal);
  await updateGalleryDl(onStatus, signal);
}

// src/cli.tsx
import { jsx as jsx9 } from "react/jsx-runtime";
var VERSION = createRequire(import.meta.url)("../package.json").version;
var HELP = `
  yoinks \u2014 yoink videos, images, galleries, and audio.

  Usage
    $ yoinks [url]

  Examples
    $ yoinks https://youtu.be/dQw4w9WgXcQ
    $ yoinks https://www.instagram.com/reel/abc123/
    $ yoinks https://www.instagram.com/p/DbAY89yiZrJ/
    $ yoinks                 (prompts for a url)

  Options
    --theme <mode>  use auto, light, or dark for this run
    --update-tools  update managed yt-dlp and gallery-dl
    -h, --help      show this help
    -v, --version   show version

  Downloads are saved to ~/Downloads.
  Powered by yt-dlp + gallery-dl.
`;
var args = parseArgs(process.argv.slice(2));
if (args.error) {
  console.error(`yoinks: ${args.error}
Try \u201Cyoinks --help\u201D for usage.`);
  process.exit(1);
}
if (args.help) {
  console.log(HELP);
  process.exit(0);
}
if (args.version) {
  console.log(VERSION);
  process.exit(0);
}
if (args.updateTools) {
  try {
    await updateDownloaders((message) => console.log(`\u2022 ${message}`));
    console.log("\u2713 yt-dlp and gallery-dl are up to date");
    process.exit(0);
  } catch (error) {
    console.error(`yoinks: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
var initialUrl = args.initialUrl;
var initialThemeMode = args.themeMode ?? "auto";
var isTTY = Boolean(process.stdout.isTTY);
var clipboardUrl;
if (!initialUrl && isTTY) {
  const clipped = readClipboard().trim();
  if (clipped && !/\s/.test(clipped) && isProbablyUrl(clipped)) clipboardUrl = clipped;
}
var enterAltScreen = () => process.stdout.write("\x1B[?1049h\x1B[H");
var leaveAltScreen = () => process.stdout.write("\x1B[?1006l\x1B[?1000l\x1B[?1049l");
if (isTTY) {
  enterAltScreen();
  process.on("exit", leaveAltScreen);
  for (const event of ["uncaughtException", "unhandledRejection"]) {
    process.on(event, (error) => {
      leaveAltScreen();
      console.error(error);
      process.exit(1);
    });
  }
}
var outcome = {};
var { waitUntilExit } = render(
  /* @__PURE__ */ jsx9(
    App,
    {
      initialUrl,
      clipboardUrl,
      initialThemeMode,
      onOutcome: (result) => outcome = result
    }
  ),
  // keep a copy of every frame so clicks can be hit-tested against it
  { stdout: captureFrames(process.stdout) }
);
await waitUntilExit();
if (isTTY) leaveAltScreen();
if (outcome.filepath) {
  console.log(`\u2713 yoinked \u2192 ${outcome.filepath}`);
}
