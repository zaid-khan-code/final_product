'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'md' | 'sm'

type BaseProps = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>

type ButtonLinkProps = BaseProps & {
  href: string
}

const getClassName = (variant: ButtonVariant, size: ButtonSize, className?: string) =>
  ['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : '', className ?? ''].filter(Boolean).join(' ')

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={getClassName(variant, size, className)} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({ children, href, variant = 'secondary', size = 'md', className }: ButtonLinkProps) {
  return (
    <Link href={href} className={getClassName(variant, size, className)}>
      {children}
    </Link>
  )
}
