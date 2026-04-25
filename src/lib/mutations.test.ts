import test from 'node:test'
import assert from 'node:assert/strict'
import { getFieldIssueMessage } from './mutation-errors.ts'

test('returns formatted validation message when field issues exist', () => {
  const message = getFieldIssueMessage([{ field: 'start_date', message: 'Required' }])

  assert.equal(message, 'start_date: Required')
})

test('falls back to last path segment when field is absent', () => {
  const message = getFieldIssueMessage([{ path: ['body', 'end_date'], message: 'Invalid date' }])

  assert.equal(message, 'end_date: Invalid date')
})

test('returns null when details do not contain validation issues', () => {
  const message = getFieldIssueMessage({ error: 'nope' })

  assert.equal(message, null)
})
