'use client'

import type { HTMLAttributes, ReactNode } from 'react'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  tone?: BadgeTone
}

export function Badge({ children, tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span className={['badge', `badge-${tone}`, className ?? ''].filter(Boolean).join(' ')} {...props}>
      {children}
    </span>
  )
}
