import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Logo />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-8xl font-extrabold text-primary">404</h1>
            <h2 className="text-2xl font-bold">Link not found</h2>
            <p className="text-muted-foreground">
              {"The short link you're looking for doesn't exist or has been removed."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/">
              <Button size="lg" className="gap-2">
                <Home className="w-4 h-4" />
                Go home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                View your links
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

