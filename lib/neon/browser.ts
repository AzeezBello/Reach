export function createClient() {
  return {
    auth: {
      async getSession() {
        try {
          const response = await fetch("/api/auth/session", {
            method: "GET",
            credentials: "include",
          });
          return await response.json();
        } catch (err: any) {
          return {
            data: { session: null },
            error: { message: err?.message || "Failed to fetch session." },
          };
        }
      },

      async signUp(params: {
        email: string;
        password: string;
        options?: { data?: Record<string, unknown> };
      }) {
        try {
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              action: "signUp",
              email: params.email,
              password: params.password,
              options: params.options,
            }),
          });
          return await response.json();
        } catch (err: any) {
          return {
            data: { user: null, session: null },
            error: { message: err?.message || "Failed to create account." },
          };
        }
      },

      async resetPasswordForEmail(
        email: string,
        options?: { redirectTo?: string }
      ) {
        try {
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              action: "resetPasswordForEmail",
              email,
              options,
            }),
          });
          return await response.json();
        } catch (err: any) {
          return {
            data: null,
            error: { message: err?.message || "Failed to send password reset." },
          };
        }
      },

      async updateUser(attrs: { password?: string }) {
        try {
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              action: "updateUser",
              password: attrs.password,
            }),
          });
          return await response.json();
        } catch (err: any) {
          return {
            data: { user: null },
            error: { message: err?.message || "Failed to update user." },
          };
        }
      },

      async signOut() {
        try {
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ action: "signOut" }),
          });
          return await response.json();
        } catch (err: any) {
          return { error: { message: err?.message || "Failed to sign out." } };
        }
      },
    },
  };
}
