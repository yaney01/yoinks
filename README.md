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

Requires Node 22+. Both managed downloader backends live under one root:

```text
~/.yoinks/bin/
├── yt-dlp
└── gallery-dl/
```

`yt-dlp` is downloaded automatically when needed. For image and gallery links,
yoinks creates a private Python environment under `~/.yoinks/bin/gallery-dl`
and installs gallery-dl there. A system gallery-dl installation is used only
when Python is unavailable.

On macOS, installing Python and gallery-dl with Homebrew first remains optional:

```sh
brew install python gallery-dl
```

Older builds used `~/.yoinks/gallery-dl`. After confirming the new build works,
that old directory can be removed manually.

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

## Instagram login cookies

Instagram frequently returns no media to anonymous requests. When this happens,
yoinks automatically retries with Chrome cookies. It scans the Chrome `Default`
and numbered `Profile 1`, `Profile 2`, and later profile directories, then
reuses the successful profile for the actual download.

Chrome may request macOS Keychain permission the first time. If cookie access
fails, yoinks now reports the underlying gallery-dl warning, such as a locked
cookie database, decryption failure, missing profile, or permission error.
Closing Chrome before retrying can resolve database-access failures.

For Safari, Firefox, a custom Chrome location, or to force one profile, set the
cookie source for that run:

```sh
YOINKS_COOKIES_FROM_BROWSER="chrome/instagram.com:Profile 1" yoinks "<instagram-url>"
YOINKS_COOKIES_FROM_BROWSER="safari/instagram.com" yoinks "<instagram-url>"
YOINKS_COOKIES_FROM_BROWSER="firefox/instagram.com" yoinks "<instagram-url>"
```

The value follows gallery-dl's `--cookies-from-browser` syntax:
`BROWSER[/DOMAIN][+KEYRING][:PROFILE][::CONTAINER]`.

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
