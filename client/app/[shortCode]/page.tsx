import { redirect, notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ shortCode: string }>;
}

async function getRedirectUrl(shortCode: string): Promise<string | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8080";
    const response = await fetch(`${apiUrl}/r/${shortCode}`, {
      cache: "no-store", // Don't cache redirects
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data?.originalUrl) {
      return data.data.originalUrl;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch redirect URL:", error);
    return null;
  }
}

export default async function RedirectPage({ params }: PageProps) {
  const { shortCode } = await params;
  
  // Skip if it's a known route
  const knownRoutes = ["auth", "dashboard", "profile", "api", "favicon.ico"];
  if (knownRoutes.includes(shortCode)) {
    notFound();
  }

  const originalUrl = await getRedirectUrl(shortCode);

  if (!originalUrl) {
    notFound();
  }

  redirect(originalUrl);
}

