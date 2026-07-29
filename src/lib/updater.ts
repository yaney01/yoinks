import {spawn} from 'node:child_process'
import {createWriteStream} from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {Readable} from 'node:stream'
import {pipeline} from 'node:stream/promises'

const BIN_DIR = path.join(os.homedir(), '.yoinks', 'bin')
const YTDLP_PATH = path.join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp')
const GALLERYDL_DIR = path.join(BIN_DIR, 'gallery-dl')
const GALLERYDL_NEXT_DIR = path.join(BIN_DIR, 'gallery-dl.next')
const RELEASE_BASE = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download'

type PythonCommand = {cmd: string; prefix: string[]}

function commandWorks(cmd: string, args: string[]): Promise<boolean> {
  return new Promise(resolve => {
    let child
    try {
      child = spawn(cmd, args, {stdio: 'ignore', timeout: 15_000})
    } catch {
      resolve(false)
      return
    }
    child.on('error', () => resolve(false))
    child.on('close', code => resolve(code === 0))
  })
}

function runCommand(cmd: string, args: string[], signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {signal, stdio: ['ignore', 'ignore', 'pipe']})
    let stderr = ''
    child.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()))
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(stderr.trim() || `${path.basename(cmd)} exited with code ${code}`))
    })
  })
}

function ytDlpAssetName(): string {
  if (process.platform === 'win32') return 'yt-dlp.exe'
  if (process.platform === 'darwin') return 'yt-dlp_macos'
  return process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux'
}

async function replaceFile(next: string, current: string): Promise<void> {
  const previous = `${current}.previous`
  await fs.rm(previous, {force: true})
  let hasPrevious = false
  try {
    await fs.rename(current, previous)
    hasPrevious = true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }

  try {
    await fs.rename(next, current)
    await fs.rm(previous, {force: true})
  } catch (error) {
    await fs.rm(current, {force: true})
    if (hasPrevious) await fs.rename(previous, current)
    throw error
  }
}

async function updateYtDlp(onStatus: (message: string) => void, signal?: AbortSignal): Promise<void> {
  onStatus('downloading latest yt-dlp…')
  await fs.mkdir(BIN_DIR, {recursive: true})
  const next = `${YTDLP_PATH}.next`
  await fs.rm(next, {force: true})

  try {
    const response = await fetch(`${RELEASE_BASE}/${ytDlpAssetName()}`, {signal})
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)
    await pipeline(Readable.fromWeb(response.body as never), createWriteStream(next), {signal})
    await fs.chmod(next, 0o755)
    if (!(await commandWorks(next, ['--version']))) throw new Error('downloaded yt-dlp could not be started')
    await replaceFile(next, YTDLP_PATH)
  } catch (error) {
    await fs.rm(next, {force: true})
    throw new Error(`Could not update yt-dlp: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function pythonCandidates(): PythonCommand[] {
  const configured = process.env.YOINKS_PYTHON?.trim()
  if (process.platform === 'win32') {
    return [
      ...(configured ? [{cmd: configured, prefix: []}] : []),
      {cmd: 'py', prefix: ['-3']},
      {cmd: 'python3', prefix: []},
      {cmd: 'python', prefix: []},
    ]
  }
  return [
    ...(configured ? [{cmd: configured, prefix: []}] : []),
    ...(process.platform === 'darwin'
      ? [
          {cmd: '/opt/homebrew/bin/python3', prefix: []},
          {cmd: '/usr/local/bin/python3', prefix: []},
        ]
      : []),
    {cmd: 'python3', prefix: []},
    {cmd: 'python', prefix: []},
  ]
}

async function findPython(): Promise<PythonCommand | undefined> {
  const check = [
    'import ssl, sys',
    "assert sys.version_info >= (3, 10), 'Python 3.10+ required'",
    "assert 'OpenSSL' in ssl.OPENSSL_VERSION, ssl.OPENSSL_VERSION",
  ].join('; ')
  for (const candidate of pythonCandidates()) {
    if (await commandWorks(candidate.cmd, [...candidate.prefix, '-c', check])) return candidate
  }
  return undefined
}

function galleryDlPaths(root: string): {python: string; executable: string} {
  if (process.platform === 'win32') {
    return {
      python: path.join(root, 'Scripts', 'python.exe'),
      executable: path.join(root, 'Scripts', 'gallery-dl.exe'),
    }
  }
  return {
    python: path.join(root, 'bin', 'python'),
    executable: path.join(root, 'bin', 'gallery-dl'),
  }
}

async function replaceDirectory(next: string, current: string): Promise<void> {
  const previous = `${current}.previous`
  await fs.rm(previous, {recursive: true, force: true})
  let hasPrevious = false
  try {
    await fs.rename(current, previous)
    hasPrevious = true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }

  try {
    await fs.rename(next, current)
    await fs.rm(previous, {recursive: true, force: true})
  } catch (error) {
    await fs.rm(current, {recursive: true, force: true})
    if (hasPrevious) await fs.rename(previous, current)
    throw error
  }
}

async function updateGalleryDl(onStatus: (message: string) => void, signal?: AbortSignal): Promise<void> {
  const python = await findPython()
  if (!python) {
    throw new Error('Could not update gallery-dl: Python 3.10+ linked with OpenSSL is required. On macOS run “brew install python”.')
  }

  onStatus('installing latest gallery-dl…')
  await fs.mkdir(BIN_DIR, {recursive: true})
  await fs.rm(GALLERYDL_NEXT_DIR, {recursive: true, force: true})
  const next = galleryDlPaths(GALLERYDL_NEXT_DIR)

  try {
    await runCommand(python.cmd, [...python.prefix, '-m', 'venv', GALLERYDL_NEXT_DIR], signal)
    await runCommand(
      next.python,
      ['-m', 'pip', 'install', '--disable-pip-version-check', '--upgrade', 'gallery-dl'],
      signal,
    )
    if (!(await commandWorks(next.executable, ['--version']))) {
      throw new Error('new gallery-dl environment could not be started')
    }
    await replaceDirectory(GALLERYDL_NEXT_DIR, GALLERYDL_DIR)
  } catch (error) {
    await fs.rm(GALLERYDL_NEXT_DIR, {recursive: true, force: true})
    throw new Error(`Could not update gallery-dl: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/** Update both managed backends without changing them during normal downloads. */
export async function updateDownloaders(
  onStatus: (message: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  await updateYtDlp(onStatus, signal)
  await updateGalleryDl(onStatus, signal)
}
