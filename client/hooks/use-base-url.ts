"use client";

import { useState, useEffect } from "react";

export function useBaseUrl() {
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    // Always use window.location.origin on the client
    // This automatically adapts to:
    // - localhost:3000 in development
    // - your-app.vercel.app in production
    // - your-custom-domain.com when you add a custom domain
    setBaseUrl(window.location.origin);
  }, []);

  return baseUrl;
}

