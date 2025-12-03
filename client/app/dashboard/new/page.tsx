"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStoreValue } from "@simplestack/store/react";
import { tokenStore } from "@/lib/auth-store";
import { linksApi } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Link2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getBaseUrl } from "@/hooks/get-base-url";

export default function NewLinkPage() {
  return (
    <ProtectedRoute>
      <NewLinkContent />
    </ProtectedRoute>
  );
}

function NewLinkContent() {
  const router = useRouter();
  const token = useStoreValue(tokenStore);

  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const generateRandomCode = () => {
    const code = Math.random().toString(36).substring(2, 9);
    setCustomCode(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    // Basic URL validation
    try {
      new URL(originalUrl);
    } catch {
      toast.error("Invalid URL", {
        description:
          "Please enter a valid URL starting with http:// or https://",
      });
      return;
    }

    setLoading(true);

    try {
      const newLink = await linksApi.createLink(
        token,
        originalUrl,
        customCode || undefined
      );

      if (!newLink) {
        toast.error("Failed to create link", {
          description: "Please try again.",
        });
        return;
      }

      toast.success("Link created!", {
        description: `Your short link is ready: ${getBaseUrl()}/${newLink.shortCode}`,
      });

      router.push("/dashboard");
    } catch (error) {
      toast("Error", {
        description: "Failed to create link. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            {"Back to dashboard"}
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                {"Create new link"}
              </CardTitle>
              <CardDescription>
                {"Shorten your long URL and customize your short link"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="originalUrl">
                    {"Destination URL"}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="originalUrl"
                    type="url"
                    placeholder="https://example.com/your-long-url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {"Enter the URL you want to shorten"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customCode">
                    {"Custom short code"}
                    <span className="text-muted-foreground ml-1">
                      {"(optional)"}
                    </span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 border border-input rounded-md bg-muted">
                      <span className="text-sm text-muted-foreground">
                        {`${getBaseUrl()}/`}
                      </span>
                      <Input
                        id="customCode"
                        type="text"
                        placeholder="my-custom-code"
                        value={customCode}
                        onChange={(e) =>
                          setCustomCode(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-_]/g, "")
                          )
                        }
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        pattern="[a-z0-9_-]+"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomCode}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {"Generate"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {"Leave empty to auto-generate a random code"}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      className="flex-1"
                    >
                      {"Cancel"}
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !originalUrl}
                      className="flex-1"
                    >
                      {loading ? "Creating..." : "Create link"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview Card */}
          {originalUrl && (
            <Card className="mt-6 bg-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">{"Preview"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Short link"}
                  </p>
                  <p className="font-mono text-accent">
                    {`${origin}/`}
                    {customCode || "(auto-generated)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {"Destination"}
                  </p>
                  <p className="text-sm truncate">{originalUrl}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
