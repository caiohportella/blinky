import { isLoadingStore } from "./auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  userId: string;
  favicon?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const authApi = {
  async signup(
    email: string,
    password: string,
    name: string
  ): Promise<{
    user: User | null;
    token: string | null;
    error?: string | null;
  }> {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const res: ApiResponse<{
        id: number;
        email: string;
        name: string;
        role: string;
        token: string;
      }> = await response.json();

      if (!response.ok || !res.success || res.error) {
        return {
          user: null,
          token: null,
          error: res.error || "Signup failed",
        };
      }

      return {
        user: {
          id: String(res.data!.id),
          email: res.data!.email,
          name: res.data!.name,
          role: res.data!.role.toLowerCase() as "user" | "admin",
          createdAt: new Date().toISOString(),
        },
        token: res.data!.token,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        token: null,
        error: error instanceof Error ? error.message : "Signup failed",
      };
    } finally {
      isLoadingStore.set(false);
    }
  },

  async signin(
    email: string,
    password: string
  ): Promise<{
    user: User | null;
    token: string | null;
    error?: string | null;
  }> {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const res: ApiResponse<{
        id: number;
        email: string;
        name: string;
        role: string;
        token: string;
      }> = await response.json();

      // Check for HTTP errors (401, 400, etc.)
      if (!response.ok) {
        return {
          user: null,
          token: null,
          error: res.error || "Invalid email or password",
        };
      }

      if (!res.success || res.error) {
        return {
          user: null,
          token: null,
          error: res.error || "Invalid email or password",
        };
      }

      return {
        user: {
          id: String(res.data!.id),
          email: res.data!.email,
          name: res.data!.name,
          role: res.data!.role.toLowerCase() as "user" | "admin",
          createdAt: new Date().toISOString(),
        },
        token: res.data!.token,
        error: null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      return {
        user: null,
        token: null,
        error: message.includes("fetch") ? "Unable to connect to server" : message,
      };
    }
  },

  async signout(): Promise<void> {
    // Client-side only logout - just clear local state
    // The JWT will expire naturally on the server side
  },

  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res: ApiResponse<{
        id: number;
        email: string;
        name: string;
        role: string;
        createdAt: string;
      }> = await response.json();

      if (!res.success || !res.data) {
        return null;
      }

      return {
        id: String(res.data.id),
        email: res.data.email,
        name: res.data.name,
        role: res.data.role.toLowerCase() as "user" | "admin",
        createdAt: res.data.createdAt,
      };
    } catch {
      return null;
    }
  },
};

// Links API calls
export const linksApi = {
  async getLinks(token: string): Promise<Link[]> {
    try {
      const response = await fetch(`${API_URL}/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res: ApiResponse<
        Array<{
          id: number;
          shortCode: string;
          originalUrl: string;
          clicks: number;
          createdAt: string;
          userId: number;
          favicon?: string;
        }>
      > = await response.json();

      if (!res.success || !res.data) {
        return [];
      }

      return res.data.map((link) => ({
        id: String(link.id),
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        clicks: link.clicks,
        createdAt: link.createdAt,
        userId: String(link.userId),
        favicon: link.favicon,
      }));
    } catch {
      return [];
    }
  },

  async createLink(
    token: string,
    originalUrl: string,
    customCode?: string
  ): Promise<Link | null> {
    try {
      const response = await fetch(`${API_URL}/links`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl, customCode }),
      });

      const res: ApiResponse<{
        id: number;
        shortCode: string;
        originalUrl: string;
        clicks: number;
        createdAt: string;
        userId: number;
        favicon?: string;
      }> = await response.json();

      if (!res.success || !res.data) {
        return null;
      }

      return {
        id: String(res.data.id),
        shortCode: res.data.shortCode,
        originalUrl: res.data.originalUrl,
        clicks: res.data.clicks,
        createdAt: res.data.createdAt,
        userId: String(res.data.userId),
        favicon: res.data.favicon,
      };
    } catch {
      return null;
    }
  },

  async deleteLink(token: string, linkId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/links/${linkId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const res: ApiResponse<null> = await response.json();
      return res.success;
    } catch {
      return false;
    }
  },

  async getLinkStats(
    token: string,
    linkId: string
  ): Promise<{ clicks: number; lastClicked?: string } | null> {
    try {
      const response = await fetch(`${API_URL}/links/${linkId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res: ApiResponse<{
        clicks: number;
        lastClicked?: string;
      }> = await response.json();

      if (!res.success || !res.data) {
        return null;
      }

      return {
        clicks: res.data.clicks,
        lastClicked: res.data.lastClicked,
      };
    } catch {
      return null;
    }
  },
};
