"use client";

import Link from "next/link";
import { useStoreValue } from "@simplestack/store/react";
import { isAuthenticatedStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

export function NavButtons() {
  const isAuthenticated = useStoreValue(isAuthenticatedStore);

  if (isAuthenticated) {
    return (
      <nav className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button size="sm" className="rounded-full shadow-md hover:shadow-lg transition-all">
            Dashboard
          </Button>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2">
      <Link href="/auth/signin">
        <Button variant="ghost" size="sm" className="rounded-full">
          Sign in
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button size="sm" className="rounded-full shadow-md hover:shadow-lg transition-all">
          Get Started
        </Button>
      </Link>
    </nav>
  );
}

