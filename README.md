# yoinks

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
  <img src="assets/logo-light.svg" alt="yoinks" width="288">
</picture>

Download videos, audio, images, galleries, manga, and mixed-media posts from one terminal interface.

- `yt-dlp` handles Reels, videos, audio, format selection, merging, and MP3 extraction.
- `gallery-dl` handles images, carousels, manga, and posts containing both images and videos.
- Managed copies are stored together under `~/.yoinks/bin`.

## Requirements

- Node.js 22 or newer. Node 24 LTS is recommended.
- Python 3.10 or newer linked with OpenSSL. On macOS, use Homebrew Python rather than the old system Python.
- A browser logged into Instagram for posts that require authentication.

## Install on macOS

Install Python and nvm:

```sh
brew install python nvm
mkdir -p ~/.nvm
```

Add this to `~/.zshrc` when Homebrew has not configured nvm automatically:

```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"
```

Reload the shell and install Node 24:

```sh
source ~/.zshrc
nvm install 24
nvm use 24
nvm alias default 24
```

Install the latest `main` build directly from GitHub:

```sh
npm uninstall -g yoinks 2>/dev/null || true
npm install -g github:yaney01/yoinks
```

The repository includes a verified `dist/cli.js`, so GitHub installation does not compile the project on the user’s machine.

Verify:

```sh
node -v
python3 -c 'import ssl,sys; print(sys.version); print(ssl.OPENSSL_VERSION)'
yoinks --version
yoinks --help
```

The first applicable download installs the backends here:

```text
~/.yoinks/bin/
├── yt-dlp
└── gallery-dl/
```

A system installation can be used as a fallback, but the managed copies are the recommended setup.

## Use

```sh
yoinks "https://youtu.be/..."
yoinks "https://www.instagram.com/reel/.../"
yoinks "https://www.instagram.com/p/.../"
yoinks
```

Downloads are saved to `~/Downloads`.

- Videos and audio are saved as individual files.
- Galleries and mixed posts use a folder such as `~/Downloads/instagram-DbAY89yiZrJ/`.
- Mixed Instagram posts offer `all media`, `images only`, and `videos only`.

## Media routing

```text
Reels, single videos, audio
└─ yt-dlp → resolution and MP3 choices

Images, carousels, manga
└─ gallery-dl → original media files

Image + video mixed posts
└─ gallery-dl → all / images only / videos only
```

Instagram `/p/` links are inspected with gallery-dl first. A post containing exactly one video is handed to yt-dlp so resolution and audio choices remain available. Reels go directly to yt-dlp.

The gallery parser follows gallery-dl's native message protocol: type `2` is directory/post metadata and type `3` is an actual downloadable media URL.

## Instagram login

yoinks checks local Chrome profiles for a non-expired Instagram `sessionid`, prioritizes the last-used profile, and passes only that profile to gallery-dl. This avoids repeatedly contacting Instagram with every Chrome profile.

To force a browser or profile:

```sh
YOINKS_COOKIES_FROM_BROWSER="chrome/.instagram.com:Default" yoinks "<instagram-url>"
YOINKS_COOKIES_FROM_BROWSER="chrome/.instagram.com:Profile 1" yoinks "<instagram-url>"
YOINKS_COOKIES_FROM_BROWSER="safari/.instagram.com" yoinks "<instagram-url>"
YOINKS_COOKIES_FROM_BROWSER="firefox/.instagram.com" yoinks "<instagram-url>"
```

If Instagram returns `429 Too Many Requests`, yoinks stops immediately. Do not keep retrying; wait and make one new attempt after the restriction clears.

## Update yoinks

Update the application code from `main`:

```sh
npm install -g github:yaney01/yoinks
```

## Update yt-dlp and gallery-dl

The upstream tools are not silently replaced during normal downloads. This avoids an unexpected upstream release breaking a working installation.

Update both managed tools explicitly:

```sh
yoinks --update-tools
```

The command downloads or installs each new version into a temporary path, verifies that it starts, and then swaps it into `~/.yoinks/bin`. If an update fails, the existing working copy is restored or retained.

To rebuild both managed tools from scratch:

```sh
rm -rf ~/.yoinks/bin
yoinks --update-tools
```

A weekly GitHub Actions smoke test also installs the latest upstream tools so packaging or runtime incompatibilities are visible in the repository before the next yoinks release.

## Local development

```sh
git clone https://github.com/yaney01/yoinks.git
cd yoinks
npm install
npm run check
npm link
yoinks "<url>"
```

## Troubleshooting

Check the active versions:

```sh
which yoinks
yoinks --version
~/.yoinks/bin/yt-dlp --version
~/.yoinks/bin/gallery-dl/bin/gallery-dl --version
```

On macOS, the managed gallery-dl environment should report OpenSSL rather than LibreSSL:

```sh
~/.yoinks/bin/gallery-dl/bin/python -c 'import ssl; print(ssl.OPENSSL_VERSION)'
```

If Chrome cookies cannot be read, close Chrome completely and retry once, or provide `YOINKS_COOKIES_FROM_BROWSER` explicitly.

## Fair use

yoinks is a personal-archiving tool. Only download media you have the right to keep, and follow the platform's terms and applicable law.

## License

[MIT](LICENSE)
