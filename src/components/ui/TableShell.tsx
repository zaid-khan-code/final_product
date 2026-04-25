'use client'

import type { ReactNode } from 'react'

type TableShellProps = {
  children: ReactNode
}

export function TableShell({ children }: TableShellProps) {
  return <div className="table-wrap">{children}</div>
}
