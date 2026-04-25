import test from 'node:test'
import assert from 'node:assert/strict'
import { proxyMatcher } from './proxy-routes.ts'

test('proxy matcher includes bare config route', () => {
  assert.equal(proxyMatcher.includes('/config'), true)
})

test('proxy matcher keeps nested config routes protected', () => {
  assert.equal(proxyMatcher.includes('/config/:path*'), true)
})
