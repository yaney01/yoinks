# yoinks

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
  <img src="assets/logo-light.svg" alt="yoinks" width="288">
</picture>

yoink videos, images, galleries, and audio. paste. choose. done.

Download media from YouTube, X/Twitter, Instagram, Threads, TikTok, Pixiv,
manga sites, and thousands of other supported pages — directly from your
terminal. Video links keep the resolution and MP3 picker; galleries and mixed
posts let you choose all media, images only, or videos only.

<img src="assets/home.png" alt="yoinks home screen — paste a link and hit yoink" width="100%">

## Install

```sh
npm install -g yoinks
```

Or run it without a permanent global install:

```sh
npx yoinks
```

Requires Node 22+. The managed download backends share one installation root:

```text
~/.yoinks/bin/
├── yt-dlp
└── gallery-dl/
```

`yt-dlp` is downloaded automatically when needed. For image and gallery links,
yoinks creates a private Python environment at `~/.yoinks/bin/gallery-dl` and
installs `gallery-dl` inside it. A system/Homebrew installation is used only as
a fallback when Python is unavailable.

Existing versions that used `~/.yoinks/gallery-dl` no longer read that folder.
After confirming the new version works, it can be removed manually.

## Usage

```sh
$ yoinks https://youtu.be/dQw4w9WgXcQ
$ yoinks https://www.instagram.com/reel/...
$ yoinks https://www.instagram.com/p/DbAY89yiZrJ/
$ yoinks
$ yoinks --theme light
```

yoinks takes over the terminal and restores your scrollback on exit. Pick an
option with ↑/↓, j/k, number keys, or the mouse, then press enter. `esc` goes
back and `^c` quits.

Downloads are saved to `~/Downloads`:

- Videos and audio are saved as individual files.
- Galleries and mixed posts are saved in a site-and-post folder such as
  `~/Downloads/instagram-DbAY89yiZrJ`.

The default `auto` theme follows the terminal foreground and background. Press
`^t` or click the theme control to cycle through `auto`, `light`, and `dark`.

<img src="assets/download-options.png" alt="yoinks format picker — video resolutions, audio, and media choices" width="100%">

## Media routing

The input URL and extracted media determine which backend is used:

```text
Reels, videos, audio
  └─ yt-dlp → resolution / MP3 choices

Images, galleries, manga
  └─ gallery-dl → original media files

Mixed image + video posts
  └─ gallery-dl → all / images only / videos only
```

Instagram `/p/` links are inspected with gallery-dl first. A single-video post
is handed back to yt-dlp so resolution and audio options remain available.
Instagram Reels go directly to yt-dlp. For other sites, yoinks tries yt-dlp and
falls back to gallery-dl when the page is a gallery or collection.

If gallery-dl needs authentication, configure its normal cookie settings. For
example, add browser cookies to your gallery-dl configuration or verify the
link directly with:

```sh
gallery-dl --cookies-from-browser chrome "<url>"
```

## How it works

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) handles video/audio extraction,
  format selection, and downloads. Its standalone binary is cached at
  `~/.yoinks/bin/yt-dlp`.
- [gallery-dl](https://github.com/mikf/gallery-dl) enumerates image galleries,
  manga, carousels, and mixed-media posts. Its managed environment is stored at
  `~/.yoinks/bin/gallery-dl`.
- ffmpeg is used for stream merging and MP3 extraction. yoinks checks PATH and
  falls back to `ffmpeg-static`.
- The terminal UI is built with [Ink](https://github.com/vadimdemedes/ink).

## Development

```sh
npm install
npm test
npm run typecheck
npm run build
node dist/cli.js <url>
```

To test the current checkout as a global command:

```sh
npm link
yoinks <url>
```

## Roadmap

- [ ] `--best` / `--mp3` flags for scriptable downloads
- [ ] `-o <dir>` to choose the output directory
- [ ] Browser-cookie selection inside the UI
- [ ] Detailed per-file progress for gallery downloads
- [ ] Clipboard auto-suggestion without opening the input screen first
- [ ] Self-update for cached downloader binaries

## A note on fair use

yoinks is a personal-archiving tool. Downloading content may violate a
platform's terms of service. Only download media you have the right to keep.

## License

[MIT](LICENSE)
