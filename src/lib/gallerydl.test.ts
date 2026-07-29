import assert from 'node:assert/strict'
import test from 'node:test'
import {__test, galleryChoices} from './gallerydl.js'

test('recognizes Instagram posts and Reels separately', () => {
  assert.equal(__test.isInstagramPost('https://www.instagram.com/p/DbAY89yiZrJ/'), true)
  assert.equal(__test.isInstagramPost('https://www.instagram.com/reel/abc/'), false)
  assert.equal(__test.isInstagramReel('https://www.instagram.com/reel/abc/'), true)
  assert.equal(__test.isInstagramReel('https://www.instagram.com/p/abc/'), false)
})

test('parses gallery-dl JSON messages and classifies mixed media', () => {
  const stdout = JSON.stringify([
    [1, '', {title: 'Example'}],
    [2, 'https://cdn.example/1.jpg', {extension: 'jpg'}],
    [2, 'https://cdn.example/2.mp4', {extension: 'mp4'}],
  ])
  const items = __test.parseGalleryJson(stdout)
  assert.equal(items.length, 2)
  assert.deepEqual(__test.summarizeGallery(items), {
    count: 2,
    imageCount: 1,
    videoCount: 1,
    otherCount: 0,
  })
})

test('builds all, image-only, and video-only choices for mixed posts', () => {
  assert.deepEqual(
    galleryChoices({count: 4, imageCount: 3, videoCount: 1, otherCount: 0}).map(choice => choice.label),
    ['all media · 4 files', 'images only · 3 images', 'videos only · 1 video'],
  )
})

test('does not classify successful browser cookie logs as failures', () => {
  const stderr = [
    '[cookies][info] Extracted 13 cookies from Chrome',
    "[cookies][debug] version breakdown: {'v10': 13, 'other': 0, 'unencrypted': 0}",
  ].join('\n')
  assert.equal(__test.cookieDiagnostic(stderr), undefined)
})

test('extracts actual browser cookie failures', () => {
  assert.equal(
    __test.cookieDiagnostic('[cookies][warning] Failed to decrypt cookie (AES-GCM MAC)'),
    'Failed to decrypt cookie (AES-GCM MAC)',
  )
})

test('extracts Instagram response failures without cookie success noise', () => {
  const stderr = [
    '[cookies][info] Extracted 13 cookies from Chrome',
    "[cookies][debug] version breakdown: {'v10': 13}",
    '[instagram][warning] Login required for this endpoint',
  ].join('\n')
  assert.equal(__test.instagramDiagnostic(stderr), 'Login required for this endpoint')
})

test('detects Instagram rate-limit responses', () => {
  assert.equal(__test.isRateLimitMessage('429 Too Many Requests'), true)
  assert.equal(__test.isRateLimitMessage('API rate limit reached'), true)
  assert.equal(__test.isRateLimitMessage('not found'), false)
})

test('prioritizes the last-used Chrome profile and includes subdomain cookies', () => {
  assert.deepEqual(
    __test.orderChromeProfiles(['Default', 'Profile 2', 'Profile 3'], 'Profile 3'),
    ['Profile 3', 'Default', 'Profile 2'],
  )
  assert.equal(__test.chromeCookieSource('Default'), 'chrome/.instagram.com:Default')
})
