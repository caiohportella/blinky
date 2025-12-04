"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStoreValue } from "@simplestack/store/react";
import { isAuthenticatedStore, signout } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function NavButtons() {
  const router = useRouter();
  const isAuthenticated = useStoreValue(isAuthenticatedStore);

  const handleLogout = async () => {
    await signout();
    toast.success("Logged out", {
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  if (isAuthenticated) {
    return (
      <nav className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button size="sm" className="rounded-full shadow-md hover:shadow-lg transition-all">
            Dashboard
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
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

