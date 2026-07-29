import {spawn, type ChildProcess} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const YOINKS_ROOT = path.join(os.homedir(), '.yoinks')
const YOINKS_BIN_DIR = path.join(YOINKS_ROOT, 'bin')
const GALLERYDL_ENV_DIR = path.join(YOINKS_BIN_DIR, 'gallery-dl')

const IMAGE_EXTENSIONS = new Set(['avif', 'bmp', 'gif', 'heic', 'heif', 'jpeg', 'jpg', 'jxl', 'png', 'tif', 'tiff', 'webp'])
const VIDEO_EXTENSIONS = new Set(['avi', 'flv', 'm2ts', 'm4v', 'mkv', 'mov', 'mp4', 'mpeg', 'mpg', 'ts', 'webm', 'wmv'])
const CHROME_EPOCH_OFFSET_MICROSECONDS = 11_644_473_600_000_000

export type GalleryMode = 'all' | 'images' | 'videos'
type InstagramApi = 'rest' | 'graphql'

export type GallerySummary = {
  count: number
  imageCount: number
  videoCount: number
  otherCount: number
}

export type GalleryProbe = {
  title: string
  uploader?: string
  summary: GallerySummary
}

type GalleryItem = {url: string; extension?: string; metadata: Record<string, unknown>}
type PythonCommand = {cmd: string; prefix: string[]}
type GalleryAttempt = {items: GalleryItem[]; stderr: string}
type InstagramSession = {cookieSource: string; api: InstagramApi}

const instagramSessionByUrl = new Map<string, InstagramSession>()

class CommandError extends Error {
  readonly stderr: string
  readonly exitCode: number | null

  constructor(message: string, stderr: string, exitCode: number | null) {
    super(message)
    this.name = 'CommandError'
    this.stderr = stderr
    this.exitCode = exitCode
  }
}

function commandWorks(cmd: string, args: string[]): Promise<boolean> {
  return new Promise(resolve => {
    let child
    try {
      child = spawn(cmd, args, {stdio: 'ignore', timeout: 10_000})
    } catch {
      resolve(false)
      return
    }
    child.on('error', () => resolve(false))
    child.on('close', (code: number | null) => resolve(code === 0))
  })
}

function runCommand(cmd: string, args: string[], signal?: AbortSignal): Promise<{stdout: string; stderr: string}> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {signal})
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk: Buffer) => (stdout += chunk.toString()))
    child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()))
    child.on('error', reject)
    child.on('close', (code: number | null) => {
      if (code === 0) {
        resolve({stdout, stderr})
        return
      }
      reject(new CommandError(cleanGalleryDlError(stderr) || `${path.basename(cmd)} exited with code ${code}`, stderr, code))
    })
  })
}

async function findPython(): Promise<PythonCommand | undefined> {
  const candidates: PythonCommand[] =
    process.platform === 'win32'
      ? [
          {cmd: 'py', prefix: ['-3']},
          {cmd: 'python3', prefix: []},
          {cmd: 'python', prefix: []},
        ]
      : [
          {cmd: 'python3', prefix: []},
          {cmd: 'python', prefix: []},
        ]

  for (const candidate of candidates) {
    if (await commandWorks(candidate.cmd, [...candidate.prefix, '--version'])) return candidate
  }
  return undefined
}

function galleryDlPaths(): {executable: string; python: string} {
  if (process.platform === 'win32') {
    return {
      executable: path.join(GALLERYDL_ENV_DIR, 'Scripts', 'gallery-dl.exe'),
      python: path.join(GALLERYDL_ENV_DIR, 'Scripts', 'python.exe'),
    }
  }
  return {
    executable: path.join(GALLERYDL_ENV_DIR, 'bin', 'gallery-dl'),
    python: path.join(GALLERYDL_ENV_DIR, 'bin', 'python'),
  }
}

/** Keep both managed downloader backends under ~/.yoinks/bin. */
async function ensureGalleryDl(signal?: AbortSignal): Promise<string> {
  const local = galleryDlPaths()
  if (await commandWorks(local.executable, ['--version'])) return local.executable

  const python = await findPython()
  if (!python) {
    if (await commandWorks('gallery-dl', ['--version'])) return 'gallery-dl'
    throw new Error(
      'This link needs gallery-dl. Install Python 3, or run “brew install gallery-dl” (macOS/Linux), then try again.',
    )
  }

  await fs.mkdir(YOINKS_BIN_DIR, {recursive: true})
  await fs.rm(GALLERYDL_ENV_DIR, {recursive: true, force: true})

  try {
    await runCommand(python.cmd, [...python.prefix, '-m', 'venv', GALLERYDL_ENV_DIR], signal)
    await runCommand(
      local.python,
      ['-m', 'pip', 'install', '--disable-pip-version-check', '--upgrade', 'gallery-dl'],
      signal,
    )
  } catch (error) {
    throw new Error(
      `Could not install gallery-dl automatically. Run “brew install gallery-dl” and retry. ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
  }

  if (!(await commandWorks(local.executable, ['--version']))) {
    throw new Error('gallery-dl was installed but could not be started. Run “brew install gallery-dl” and retry.')
  }
  return local.executable
}

function isInstagramUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host === 'instagram.com' || host.endsWith('.instagram.com')
  } catch {
    return false
  }
}

export function isInstagramPost(url: string): boolean {
  try {
    return isInstagramUrl(url) && /^\/p\//.test(new URL(url).pathname)
  } catch {
    return false
  }
}

export function isInstagramReel(url: string): boolean {
  try {
    return isInstagramUrl(url) && /^\/(reel|reels|tv)\//.test(new URL(url).pathname)
  } catch {
    return false
  }
}

function chromeProfileRoot(): string | undefined {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome')
  }
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA
    return localAppData ? path.join(localAppData, 'Google', 'Chrome', 'User Data') : undefined
  }
  return path.join(os.homedir(), '.config', 'google-chrome')
}

async function chromeCookieDatabase(profileDir: string): Promise<string | undefined> {
  for (const candidate of [path.join(profileDir, 'Network', 'Cookies'), path.join(profileDir, 'Cookies')]) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // Try the next known Chrome cookie database location.
    }
  }
  return undefined
}

async function copyIfPresent(source: string, destination: string): Promise<void> {
  try {
    await fs.copyFile(source, destination)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}

async function hasValidInstagramSessionCookie(
  python: PythonCommand,
  cookieDatabase: string,
  signal?: AbortSignal,
): Promise<boolean> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yoinks-cookies-'))
  const copiedDatabase = path.join(tempDir, 'Cookies')
  try {
    await fs.copyFile(cookieDatabase, copiedDatabase)
    await copyIfPresent(`${cookieDatabase}-wal`, `${copiedDatabase}-wal`)
    await copyIfPresent(`${cookieDatabase}-shm`, `${copiedDatabase}-shm`)

    const nowChrome = Date.now() * 1000 + CHROME_EPOCH_OFFSET_MICROSECONDS
    const script = [
      'import sqlite3, sys',
      'db = sqlite3.connect(sys.argv[1])',
      "row = db.execute(\"SELECT 1 FROM cookies WHERE name='sessionid' AND host_key LIKE '%instagram.com' AND (expires_utc=0 OR expires_utc>?) LIMIT 1\", (int(sys.argv[2]),)).fetchone()",
      "print('1' if row else '0')",
    ].join('; ')
    const {stdout} = await runCommand(
      python.cmd,
      [...python.prefix, '-c', script, copiedDatabase, String(nowChrome)],
      signal,
    )
    return stdout.trim() === '1'
  } catch {
    return false
  } finally {
    await fs.rm(tempDir, {recursive: true, force: true})
  }
}

async function readLastUsedChromeProfile(root: string): Promise<string | undefined> {
  try {
    const data = JSON.parse(await fs.readFile(path.join(root, 'Local State'), 'utf8')) as {
      profile?: {last_used?: unknown}
    }
    return typeof data.profile?.last_used === 'string' ? data.profile.last_used : undefined
  } catch {
    return undefined
  }
}

function orderChromeProfiles(profiles: string[], lastUsed?: string): string[] {
  return [...profiles].sort((a, b) => {
    if (a === lastUsed) return -1
    if (b === lastUsed) return 1
    if (a === 'Default') return -1
    if (b === 'Default') return 1
    return a.localeCompare(b, undefined, {numeric: true})
  })
}

function chromeCookieSource(profile: string): string {
  // The leading dot includes cookies for both instagram.com and its subdomains.
  return `chrome/.instagram.com:${profile}`
}

async function discoverLoggedInChromeSource(signal?: AbortSignal): Promise<string | undefined> {
  const root = chromeProfileRoot()
  const python = await findPython()
  if (!root || !python) return undefined

  try {
    const entries = await fs.readdir(root, {withFileTypes: true})
    const profileNames = entries
      .filter(entry => entry.isDirectory() && (entry.name === 'Default' || /^Profile \d+$/.test(entry.name)))
      .map(entry => entry.name)
    const ordered = orderChromeProfiles(profileNames, await readLastUsedChromeProfile(root))

    for (const name of ordered) {
      const cookieDatabase = await chromeCookieDatabase(path.join(root, name))
      if (!cookieDatabase) continue
      if (await hasValidInstagramSessionCookie(python, cookieDatabase, signal)) return chromeCookieSource(name)
    }
    return undefined
  } catch {
    return undefined
  }
}

async function instagramCookieSource(signal?: AbortSignal): Promise<string | undefined> {
  const configured = process.env.YOINKS_COOKIES_FROM_BROWSER?.trim()
  if (configured) return configured
  return discoverLoggedInChromeSource(signal)
}

function metadataString(metadata: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return undefined
}

function nestedMetadataString(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined
  return metadataString(value as Record<string, unknown>, ['username', 'name', 'account', 'id'])
}

function extensionFromUrl(value: string): string | undefined {
  try {
    const ext = path.extname(new URL(value).pathname).slice(1).toLowerCase()
    return ext || undefined
  } catch {
    const ext = path.extname(value.split('?')[0] ?? '').slice(1).toLowerCase()
    return ext || undefined
  }
}

function collectGalleryItems(value: unknown, items: GalleryItem[]): void {
  if (Array.isArray(value)) {
    if (value[0] === 2 && typeof value[1] === 'string') {
      const metadata = value[2] && typeof value[2] === 'object' ? (value[2] as Record<string, unknown>) : {}
      const extension = metadataString(metadata, ['extension'])?.toLowerCase() ?? extensionFromUrl(value[1])
      items.push({url: value[1], extension, metadata})
      return
    }
    for (const child of value) collectGalleryItems(child, items)
    return
  }

  if (value && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) collectGalleryItems(child, items)
  }
}

function parseGalleryJson(stdout: string): GalleryItem[] {
  const items: GalleryItem[] = []
  const trimmed = stdout.trim()
  if (!trimmed) return items

  try {
    collectGalleryItems(JSON.parse(trimmed), items)
  } catch {
    for (const line of trimmed.split('\n')) {
      try {
        collectGalleryItems(JSON.parse(line), items)
      } catch {
        // Diagnostics are emitted on stderr; ignore non-JSON stdout lines.
      }
    }
  }

  const seen = new Set<string>()
  return items.filter(item => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

function summarizeGallery(items: GalleryItem[]): GallerySummary {
  let imageCount = 0
  let videoCount = 0
  for (const item of items) {
    if (item.extension && IMAGE_EXTENSIONS.has(item.extension)) imageCount++
    else if (item.extension && VIDEO_EXTENSIONS.has(item.extension)) videoCount++
  }
  return {count: items.length, imageCount, videoCount, otherCount: items.length - imageCount - videoCount}
}

function galleryTitle(items: GalleryItem[], url: string): string {
  for (const item of items) {
    const title = metadataString(item.metadata, ['title', 'description', 'caption', 'shortcode', 'post_id', 'id'])
    if (title) return title.replace(/\s+/g, ' ').slice(0, 120)
  }
  try {
    const parsed = new URL(url)
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/$/, '')
  } catch {
    return url
  }
}

function galleryUploader(items: GalleryItem[]): string | undefined {
  for (const item of items) {
    const direct = metadataString(item.metadata, ['username', 'user', 'author', 'account'])
    if (direct) return direct
    for (const key of ['owner', 'user', 'author']) {
      const nested = nestedMetadataString(item.metadata[key])
      if (nested) return nested
    }
  }
  return undefined
}

function stripLogPrefix(line: string): string {
  return line.replace(/^\[[^\]]+\](?:\[[^\]]+\])?\s*/, '').trim()
}

function cookieDiagnostic(stderr: string): string | undefined {
  const lines = stderr
    .split('\n')
    .map(stripLogPrefix)
    .filter(Boolean)
    .filter(line => /cookie|decrypt|keyring|permission|database|profile|session/i.test(line))
    .filter(line => /warning|error|fail|unable|denied|locked|missing|not found|invalid|expired|exception/i.test(line))

  const selected = [...new Set(lines)].slice(-2).join(' · ')
  return selected ? selected.slice(0, 420) : undefined
}

function instagramDiagnostic(stderr: string): string | undefined {
  const lines = stderr
    .split('\n')
    .map(stripLogPrefix)
    .filter(Boolean)
    .filter(line => !/^Extracted \d+ cookies from /i.test(line))
    .filter(line => !/^(?:Cookie )?version breakdown:/i.test(line))
    .filter(line => !/^Starting (?:Download|Simulation)Job/i.test(line))
    .filter(line => !/^Using Instagram\w*Extractor/i.test(line))

  const failures = lines.filter(line =>
    /warning|error|fail|invalid|expired|login|required|checkpoint|challenge|private|unavailable|not found|forbidden|unauthorized|redirect|\b(?:401|403|404|429|5\d\d)\b|too many requests|rate[ -]?limit/i.test(line),
  )
  const selected = [...new Set(failures)].slice(-3).join(' · ')
  return selected ? selected.slice(0, 600) : undefined
}

function isRateLimitMessage(value: string): boolean {
  return /\b429\b|too many requests|rate[ -]?limit/i.test(value)
}

function commandStderr(error: unknown): string {
  return error instanceof CommandError ? error.stderr : error instanceof Error ? error.message : String(error)
}

async function probeGalleryItems(
  gallerydl: string,
  url: string,
  cookieSource: string | undefined,
  api: InstagramApi | undefined,
  signal?: AbortSignal,
): Promise<GalleryAttempt> {
  const args = [
    ...(cookieSource ? ['--verbose'] : []),
    '-R',
    '0',
    '--sleep-request',
    '6.0-12.0',
    ...(api ? ['-o', `extractor.instagram.api=${api}`] : []),
    '--dump-json',
    '--simulate',
    '--no-input',
    '--no-colors',
    ...(cookieSource ? ['--cookies-from-browser', cookieSource] : []),
    url,
  ]
  const {stdout, stderr} = await runCommand(gallerydl, args, signal)
  return {items: parseGalleryJson(stdout), stderr}
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Operation cancelled.'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new Error('Operation cancelled.'))
      },
      {once: true},
    )
  })
}

export async function probeGallery(url: string, signal?: AbortSignal): Promise<GalleryProbe> {
  const gallerydl = await ensureGalleryDl(signal)

  if (!isInstagramUrl(url)) {
    const attempt = await probeGalleryItems(gallerydl, url, undefined, undefined, signal)
    if (attempt.items.length === 0) throw new Error('gallery-dl found no downloadable media at this link.')
    instagramSessionByUrl.delete(url)
    return {
      title: galleryTitle(attempt.items, url),
      uploader: galleryUploader(attempt.items),
      summary: summarizeGallery(attempt.items),
    }
  }

  const cookieSource = await instagramCookieSource(signal)
  if (!cookieSource) {
    throw new Error(
      'No Chrome profile with a valid Instagram session was found. Log in to instagram.com in Chrome, then retry, or set YOINKS_COOKIES_FROM_BROWSER to the logged-in browser profile.',
    )
  }

  const diagnostics: string[] = []
  for (const api of ['rest', 'graphql'] as const) {
    try {
      const attempt = await probeGalleryItems(gallerydl, url, cookieSource, api, signal)
      if (attempt.items.length > 0) {
        instagramSessionByUrl.set(url, {cookieSource, api})
        return {
          title: galleryTitle(attempt.items, url),
          uploader: galleryUploader(attempt.items),
          summary: summarizeGallery(attempt.items),
        }
      }

      const diagnostic = instagramDiagnostic(attempt.stderr) ?? cookieDiagnostic(attempt.stderr)
      if (diagnostic) diagnostics.push(`${api}: ${diagnostic}`)
    } catch (error) {
      const stderr = commandStderr(error)
      if (isRateLimitMessage(stderr)) {
        throw new Error(
          `Instagram rate limit reached while using ${cookieSource}. Stop retrying now and wait before trying once again.`,
        )
      }
      const diagnostic = instagramDiagnostic(stderr) ?? cookieDiagnostic(stderr)
      diagnostics.push(`${api}: ${diagnostic ?? (error instanceof Error ? error.message : String(error))}`)
    }

    if (api === 'rest') await wait(6000, signal)
  }

  const detail = diagnostics.at(-1)
  throw new Error(
    detail
      ? `Instagram returned no media using ${cookieSource}. ${detail}`
      : `Instagram cookies were read successfully from ${cookieSource}, but REST and GraphQL returned no downloadable media. Refresh the Instagram login in that Chrome profile and confirm the post is visible to the account.`,
  )
}

export function galleryChoices(summary: GallerySummary): Array<{label: string; mode: GalleryMode}> {
  const plural = (count: number, singular: string) => `${count} ${singular}${count === 1 ? '' : 's'}`

  if (summary.imageCount > 0 && summary.videoCount > 0) {
    return [
      {label: `all media · ${plural(summary.count, 'file')}`, mode: 'all'},
      {label: `images only · ${plural(summary.imageCount, 'image')}`, mode: 'images'},
      {label: `videos only · ${plural(summary.videoCount, 'video')}`, mode: 'videos'},
    ]
  }
  if (summary.imageCount > 0) {
    return [{label: `${plural(summary.imageCount, 'image')} · original files`, mode: 'images'}]
  }
  if (summary.videoCount > 0) {
    return [{label: `${plural(summary.videoCount, 'video')} · original files`, mode: 'videos'}]
  }
  return [{label: `${plural(summary.count, 'file')} · original files`, mode: 'all'}]
}

function safePathSegment(value: string): string {
  const cleaned = value
    .normalize('NFKC')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim()
  return (cleaned || 'gallery').slice(0, 80)
}

function galleryOutputDir(url: string, outDir: string): string {
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.split('/').filter(Boolean)
    const id = parts.at(-1)
    const host = parsed.hostname.replace(/^www\./, '').split('.')[0] || 'gallery'
    return path.join(outDir, safePathSegment(`${host}-${id || 'gallery'}`))
  } catch {
    return path.join(outDir, `gallery-${Date.now()}`)
  }
}

function galleryFilter(mode: GalleryMode): string[] {
  if (mode === 'all') return []
  const extensions = [...(mode === 'images' ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS)]
    .sort()
    .map(ext => `'${ext}'`)
    .join(', ')
  return ['--filter', `extension and extension.lower() in (${extensions})`]
}

function withYtDlpOnPath(ytdlp: string): NodeJS.ProcessEnv {
  if (!path.isAbsolute(ytdlp)) return process.env
  return {
    ...process.env,
    PATH: `${path.dirname(ytdlp)}${path.delimiter}${process.env.PATH ?? ''}`,
  }
}

let activeChild: ChildProcess | undefined
process.on('exit', () => activeChild?.kill('SIGTERM'))

export function downloadGallery(
  opts: {ytdlp: string; url: string; mode: GalleryMode; outDir: string},
  onProcessing: () => void,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        const gallerydl = await ensureGalleryDl(signal)
        const targetDir = galleryOutputDir(opts.url, opts.outDir)
        const instagramSession = instagramSessionByUrl.get(opts.url)
        await fs.mkdir(targetDir, {recursive: true})
        onProcessing()

        const args = [
          '--no-input',
          '--no-colors',
          '-R',
          '0',
          '--sleep-request',
          '6.0-12.0',
          '-D',
          targetDir,
          '--Print',
          'after:{_path}',
          '--Print',
          'skip:{_path}',
          ...(instagramSession ? ['-o', `extractor.instagram.api=${instagramSession.api}`] : []),
          ...(instagramSession ? ['--cookies-from-browser', instagramSession.cookieSource] : []),
          ...galleryFilter(opts.mode),
          opts.url,
        ]
        const child = spawn(gallerydl, args, {signal, env: withYtDlpOnPath(opts.ytdlp)})
        activeChild = child
        let stderr = ''
        child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()))
        child.on('error', reject)
        child.on('close', (code: number | null) => {
          activeChild = undefined
          if (signal?.aborted) {
            reject(new Error('Download cancelled.'))
            return
          }
          if (code === 0) resolve(targetDir)
          else reject(new Error(cleanGalleryDlError(stderr) || `gallery-dl exited with code ${code}`))
        })
      } catch (error) {
        reject(error)
      }
    })()
  })
}

function cleanGalleryDlError(stderr: string): string {
  const lines = stderr
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
  const last = lines.filter(line => /\[(error|warning)\]/i.test(line)).at(-1) ?? lines.at(-1)
  return last?.replace(/^\[[^\]]+\]\[(?:error|warning)\]\s*/i, '') ?? ''
}

export const __test = {
  isInstagramPost,
  isInstagramReel,
  cookieDiagnostic,
  instagramDiagnostic,
  isRateLimitMessage,
  orderChromeProfiles,
  chromeCookieSource,
  parseGalleryJson,
  summarizeGallery,
}
