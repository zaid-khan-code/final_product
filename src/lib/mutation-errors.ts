type ValidationIssue = {
  field?: string
  path?: Array<string | number>
  message?: string
}

export function getFieldIssueMessage(details: unknown) {
  if (!Array.isArray(details)) return null

  const firstIssue = details.find(
    (item): item is ValidationIssue => typeof item === 'object' && item !== null && ('message' in item || 'field' in item || 'path' in item)
  )

  if (!firstIssue?.message) return null

  const fieldName =
    firstIssue.field ??
    (Array.isArray(firstIssue.path) && firstIssue.path.length > 0 ? String(firstIssue.path[firstIssue.path.length - 1]) : null)

  return fieldName ? `${fieldName}: ${firstIssue.message}` : firstIssue.message
}
