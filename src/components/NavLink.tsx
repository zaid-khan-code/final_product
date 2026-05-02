"use client";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends LinkProps {
  className?: string | ((state: { isActive: boolean; isPending: boolean }) => string);
  children: ReactNode;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, pendingClassName, href, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === href || (typeof href === 'string' && pathname.startsWith(href) && href !== '/');
    const isPending = false; // Next.js doesn't have a direct equivalent to isPending for Link components like RRD

    const computedClassName = typeof className === 'function' 
      ? className({ isActive, isPending }) 
      : cn(className, isActive && activeClassName);

    return (
      <Link
        ref={ref}
        href={href}
        className={computedClassName}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
