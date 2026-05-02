"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e8ecf4]">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-[#16202e]">404</h1>
        <p className="mb-4 text-xl text-[#344a5e]">Oops! Page not found</p>
        <Link href="/" className="text-[#1565c0] underline hover:text-[#0d47a1]">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
