'use client'

import type { HTMLAttributes, ReactNode } from 'react'

type PillTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type PillProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  tone?: PillTone
}

export function Pill({ children, tone = 'neutral', className, ...props }: PillProps) {
  return (
    <span className={['pill', `pill-${tone}`, className ?? ''].filter(Boolean).join(' ')} {...props}>
      {children}
    </span>
  )
}
