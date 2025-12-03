export function getBaseUrl() {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }

    const isProduction = process.env.NODE_ENV == "production";

    if (isProduction) {
        // Always prioritize the custom domain if set
        if (process.env.NEXT_PUBLIC_APP_URL) {
            return process.env.NEXT_PUBLIC_APP_URL;
        }

        // Fallback to Vercel's production URL (your custom domain)
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        }

        // Last resort: use the deployment URL (not recommended for production)
        if (process.env.VERCEL_URL) {
            return `https://${process.env.VERCEL_URL}`;
        }

        throw new Error(
            "No production URL configured. Please set NEXT_PUBLIC_APP_URL environment variable.",
        );
    }

    return "http://localhost:3000";
}